"use client"; // 必须标记，因为有交互和状态

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { useChat } from '@/context/chat';
import { Role } from "@/types";
import { appendMessageItemAndFlash, askAiAction } from '@/actions/chat';

export default function ChatWrapper({ messageHistroyResult }: { success: boolean; data: { chatId: string; role: string; content: string; id: string; createdAt: Date; }[]; error?: undefined; }) {
  const message = messageHistroyResult.success ? messageHistroyResult.data.map(msg => ({ role: msg.role as Role, content: msg.content, id: msg.id })) : [];

  const params = useParams();
  const hasProcessed = useRef(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState('');
  const { pendingMessage, setPendingMessage } = useChat();

  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    message, // 这里的 message 是从 props 传进来的真实历史
    (state, newMessage: { role: Role, content: string, id: string }) => [
      ...state,
      newMessage
    ]
  );

  // 2. 增加一个 state 专门处理当前正在流式生成的 AI 回复
  const [streamingAIContent, setStreamingAIContent] = useState("");

  const prevMessageLength = useRef(message.length);
  useEffect(() => {
    // 💡 只有当从服务器传回的消息长度增加了，才清空流状态，不然在清空占位AI消息到真正根据据库刷新的消息之间的过渡会有闪烁问题
    if (message.length > prevMessageLength.current) {
      setStreamingAIContent("");
      prevMessageLength.current = message.length;
    }
  }, [message.length]);

  // 当用户在主页开启新对话时，主页会通过 context 把用户的输入（pendingMessage）传递到这个页面;此时需要默认触发一次 handleSend、且在 chat 表中新增一条数据
  // 如果用户直接访问这个页面（没有 pendingMessage），则展示历史消息
  useEffect(() => {
    if (!pendingMessage || hasProcessed.current) {
      return;
    };
    handleSend(pendingMessage);
    // 善后处理
    setPendingMessage('');
    hasProcessed.current = true;
  }, [pendingMessage, setPendingMessage]);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [optimisticMessages.length, streamingAIContent.length]);

  // 这是 streaming 版本的 handleSend，用户消息立即展示，AI 回复边接收边展示
  const handleSend = async (content?: string) => {
    const messageToSend = content?.trim() ?? prompt.trim();
    if (!messageToSend) return;

    setPrompt('');

    startTransition(async () => {
      // A. 立即添加用户的乐观消息
      addOptimisticMessage({ role: Role.USER, content: messageToSend, id: String(Date.now()) }); // 临时 ID

      // B. 先持久化用户消息到数据库
      await appendMessageItemAndFlash({
        chatId: String(params.id),
        role: Role.USER,
        content: messageToSend,
        refresh: false, // 先不触发页面刷新，等流式内容接收完再刷新
      });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({ prompt: messageToSend }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          // C. 更新流式内容 State
          setStreamingAIContent(assistantText);
        }

        // D. 流结束，清空临时状态，并真正持久化到数据库触发页面 revalidate
        await appendMessageItemAndFlash({
          chatId: String(params.id),
          role: Role.ASSISTANT,
          content: assistantText,
          refresh: true, // 这时触发页面刷新，历史消息里就有了这条 AI 回复
        });

      } catch (error) {
        console.error("流式调用失败", error);
      }
    });
    // await new Promise(resolve => setTimeout(resolve, 100));
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.chatCard}>
          <div className={styles.chatBody} ref={chatBodyRef}>
            {message.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🩺</div>
                <p>输入问题开始对话</p>
              </div>
            )}

            {optimisticMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.row} ${msg.role === Role.USER ? styles.rowUser : styles.rowAssistant}`}
              >
                {msg.role === Role.ASSISTANT && (
                  <div className={`${styles.avatar} ${styles.avatarAssistant}`}>医</div>
                )}
                <div
                  className={`${styles.bubble} ${msg.role === Role.USER ? styles.bubbleUser : styles.bubbleAssistant
                    }`}
                >
                  <div>{msg.content}</div>
                </div>
                {msg.role === Role.USER && (
                  <div className={`${styles.avatar} ${styles.avatarUser}`}>我</div>
                )}
              </div>
            ))}
            {streamingAIContent && (
              <div className={`${styles.row} ${styles.rowAssistant}`}>
                <div className={`${styles.avatar} ${styles.avatarAssistant}`}>医</div>
                <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                  {streamingAIContent}
                </div>
              </div>
            )}
            {isPending && !streamingAIContent && (
              <div className={styles.loading}>
                <span className={styles.loadingDot} />
                AI 正在思考中...
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入您的医疗咨询问题..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={isPending || prompt.trim() === ''}
                className={styles.sendButton}
              >
                {isPending ? "发送中..." : "发送"}
              </button>
            </div>
            <p className={styles.helper}>提示：该回复来自AI，请谨慎对待。</p>
          </div>
        </div>
      </div>
    </div>
  );
}