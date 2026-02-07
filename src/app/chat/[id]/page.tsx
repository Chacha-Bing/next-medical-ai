"use client"; // 必须标记，因为有交互和状态

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { useChat } from '@/context/chat';

export default function DetailChatBox({
  id,
}: {
  id: Promise<{ id: string }>
}) {
  const params = useParams();
  const hasProcessed = useRef(false);
  console.log("URL 参数是URL params:", params);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { pendingMessage, setPendingMessage } = useChat();

  useEffect(() => {
    if (!pendingMessage || hasProcessed.current) return;
    console.log("收到跨页消息pendingMessage:", pendingMessage);
    // setPrompt(pendingMessage);
    setMessages((prev) => [...prev, { role: 'user', content: pendingMessage }]);
    setPendingMessage('');
    hasProcessed.current = true;
  }, [pendingMessage, setPendingMessage]);

  const handleSend = async () => {
    if (!prompt) return;

    // 1. 先把用户的话加到列表里
    const newMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setLoading(true);
    setPrompt('');

    try {
      // 2. 调用刚才定义的接口 /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST', // 必须对应 route.ts 里的函数名
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId: 'user_cha' }),
      });

      const data = await response.json();

      // 3. 把 AI 的回答加到列表里
      setMessages([...newMessages, { role: 'assistant', content: data.result }]);
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
                className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowAssistant}`}
              >
                {msg.role === 'assistant' && (
                  <div className={`${styles.avatar} ${styles.avatarAssistant}`}>医</div>
                )}
                <div
                  className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
                    }`}
                >
                  <div>{msg.content}</div>
                </div>
                {msg.role === 'user' && (
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
                onClick={handleSend}
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