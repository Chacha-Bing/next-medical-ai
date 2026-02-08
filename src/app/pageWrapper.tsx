"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useChat } from '@/context/chat';
import { creatChatItemAndFlash } from '@/actions/chat';

export default function PageWrapper() {
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
    creatChatItemAndFlash({ chatId: id, title: content }); // 创建 chat 表的记录，为确保用户体验，先不用await这个接口而是直接router.push，如果调用失败了，后续再想办法补救
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