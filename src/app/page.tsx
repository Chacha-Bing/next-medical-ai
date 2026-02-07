"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useChat } from '@/context/chat';

export default function ChatBox() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();
  const { setPendingMessage } = useChat();

  const createHash = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID().replaceAll('-', '').slice(0, 12);
    }
    return Math.random().toString(16).slice(2, 14);
  };

  const handleSend = () => {
    const content = prompt.trim();
    if (!content) return;
    setPendingMessage(content);
    const id = createHash();
    router.push(`/chat/${id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.centerCard}>
        <h1 className={styles.title}>医疗 AI 问答</h1>
        <p className={styles.subtitle}>请输入您的医疗问题，立即开始咨询</p>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="请输入医疗问题"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={handleSend}>
            发送
          </button>
        </div>
        <p className={styles.helper}>提示：请避免输入个人隐私信息。</p>
      </div>
    </div>
  );
}