"use client"; // 必须标记，因为有交互和状态

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { useChat } from '@/context/chat';
import { Role } from "@/types";
import { appendMessageItemAndFlash, askAiAction } from '@/actions/chat';

export default function ChatWrapper({ messageHistroyResult }: { success: boolean; data: { chatId: string; role: string; content: string; id: string; createdAt: Date; }[]; error?: undefined; }) {
  const message = messageHistroyResult.success ? messageHistroyResult.data.map(msg => ({ role: msg.role as Role, content: msg.content })) : [];
  const params = useParams();
  const hasProcessed = useRef(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  console.log("URL 参数是URL params:", params);
  const [prompt, setPrompt] = useState('');
  const { pendingMessage, setPendingMessage } = useChat();

  const [isPending, startTransition] = useTransition();
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    message,
    (state, newMessage: string) => [
      ...state,
      { id: Date.now(), content: newMessage, role: "user", sending: true } // 临时 ID 和状态
    ]
  );

  // 当用户在主页开启新对话时，主页会通过 context 把用户的输入（pendingMessage）传递到这个页面;此时需要默认触发一次 handleSend、且在 chat 表中新增一条数据
  // 如果用户直接访问这个页面（没有 pendingMessage），则展示历史消息
  useEffect(() => {
    if (!pendingMessage || hasProcessed.current) {
      return;
    };
    console.log("收到跨页消息pendingMessage:", pendingMessage);
    handleSend(pendingMessage);
    // 善后处理
    setPendingMessage('');
    hasProcessed.current = true;
  }, [pendingMessage, setPendingMessage]);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [optimisticMessages.length]);

  const handleSend = async (content?: string) => {
    const messageToSend = content?.trim() ?? prompt.trim();
    console.log("茶茶准备发送消息，内容是:", content, prompt, messageToSend);
    if (!messageToSend) return;
    // 1. 先把用户的话加到列表里
    startTransition(async () => {
      addOptimisticMessage(messageToSend);
      appendMessageItemAndFlash({
        chatId: String(params.id),
        role: Role.USER,
        content: messageToSend,
      });
    });

    setPrompt('');

    const response = await askAiAction(messageToSend);
    if (response.error) {
      alert("请求失败：" + response.error);
      return;
    }
    appendMessageItemAndFlash({
      chatId: String(params.id),
      ...response.data as { role: Role; content: string; duration: number },
    });
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

            {optimisticMessages.map((msg, i) => (
              <div
                key={i}
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

            {isPending && (
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
                { isPending ? "发送中..." : "发送" }
              </button>
            </div>
            <p className={styles.helper}>提示：该回复来自AI，请谨慎对待。</p>
          </div>
        </div>
      </div>
    </div>
  );
}