"use client"; // 必须标记，因为有交互和状态

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { useChat } from '@/context/chat';
import { appendChatItem, appendMessageItem, findMessageHistroy } from '@/actions/sql';
import { Role } from "@/types";
import { useSession } from 'next-auth/react';

export default function DetailChatBox() {
  const params = useParams();
  const { data: session } = useSession();
  const hasProcessed = useRef(false);
  console.log("URL 参数是URL params:", params);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: Role, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { pendingMessage, setPendingMessage } = useChat();

  const appendChatItemFun = async ({ chatId, title, userId }: { chatId: string; title: string; userId: string }) => {
    const result = await appendChatItem({ chatId, title, userId });
    !result.success && console.error("无法创建会话:", result.error);
  }

  const appendMessageItemFun = async ({ chatId, role, content }: { chatId: string; role: Role; content: string }) => {
    const result = await appendMessageItem({ chatId, role, content });
    !result.success && console.error("无法添加消息:", result.error);
  }

  const findMessageHistroyFun = async ({ chatId }: { chatId: string }) => {
    const result = await findMessageHistroy({ chatId });
    if (result.success && result.data) {
      setMessages(result.data.map(msg => ({ role: msg.role as Role, content: msg.content })));
    } else {
      console.error("无法获取消息历史:", result.error);
    }
  }

  // 当用户在主页开启新对话时，主页会通过 context 把用户的输入（pendingMessage）传递到这个页面;此时需要默认触发一次 handleSend、且在 chat 表中新增一条数据
  // 如果用户直接访问这个页面（没有 pendingMessage），则展示历史消息
  useEffect(() => {
    if (!pendingMessage || hasProcessed.current) {
      findMessageHistroyFun({ chatId: String(params.id) });
      return;
    };
    console.log("收到跨页消息pendingMessage:", pendingMessage);
    // 写入 chat 表
    appendChatItemFun({
      chatId: String(params.id),
      title: pendingMessage,
      userId: session?.user?.id || 'unknown_user',
    });
    // 触发一次模型调用(不管有没有写入 chat 表，先保证用户体验)
    handleSend(pendingMessage);
    // 善后处理
    // revalidatePath("/"); // 直接调用这个函数会导致死循环，因为它会让当前页面重新渲染，而当前页面的 useEffect 又会被触发;正确的做法是让主页在创建新对话后去调用 revalidatePath("/")
    setPendingMessage('');
    hasProcessed.current = true;
  }, [pendingMessage, setPendingMessage]);

  const handleSend = async (content?: string) => {
    const messageToSend = content ?? prompt;
    console.log("准备发送消息，内容是:", content, prompt, messageToSend);
    if (!messageToSend) return;
    // 1. 先把用户的话加到列表里
    const newMessages = [...messages, { role: Role.USER, content: messageToSend }];
    appendMessageItemFun({
      chatId: String(params.id),
      role: Role.USER,
      content: messageToSend,
    });
    setMessages(newMessages);
    setLoading(true);
    setPrompt('');

    try {
      // 2. 调用刚才定义的接口 /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST', // 必须对应 route.ts 里的函数名
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageToSend, userId: 'user_cha' }),
      });

      const data = await response.json();
      console.log("接口返回:", data);
      if (data.error) {
        alert("请求失败：" + (data.error || "未知错误"));
        return;
      }

      // 3. 把 AI 的回答加到列表里
      setMessages([...newMessages, { role: Role.ASSISTANT, content: data.result }]);
      appendMessageItemFun({
        chatId: String(params.id),
        role: Role.ASSISTANT,
        content: data.result,
      });
    } catch (error) {
      console.error("调用失败啦Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.chatCard}>
          <div className={styles.chatBody}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🩺</div>
                <p>输入问题开始对话</p>
              </div>
            )}

            {messages.map((msg, i) => (
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

            {loading && (
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
                disabled={loading}
                className={styles.sendButton}
              >
                发送
              </button>
            </div>
            <p className={styles.helper}>提示：请避免输入个人隐私信息。</p>
          </div>
        </div>
      </div>
    </div>
  );
}