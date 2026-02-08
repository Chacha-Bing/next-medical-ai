"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Nav } from '@douyinfe/semi-ui';
import { ItemKey } from '@douyinfe/semi-ui/lib/es/navigation';
import { IconArticle, IconPlusCircle } from '@douyinfe/semi-icons';
import SliderAvatar from "@/public/avatar.jpg"
import styles from './index.module.css';
import { chatHistroyType } from '@/types';

const itemKeyEnum = {
  new: 'new',
  chat: 'chat',
};

export default function SliderDetail({ chatHistroy }: { chatHistroy: chatHistroyType }) {
  const router = useRouter();
  const pathname = usePathname();

  const chatHistoryData = chatHistroy?.length ? chatHistroy.map(chat => ({
    text: chat.title || '无标题对话',
    itemKey: chat.id,
  })) : [];

  // 现在我们采用了 React compiler, 所以不再需要用诸如 useMemo 来优化性能了，直接计算即可
  const selectedKeys = (() => {
    if (!pathname) return [itemKeyEnum.new];
    if (pathname === '/') return [itemKeyEnum.new];
    if (pathname.startsWith('/chat/')) {
      const chatId = pathname.split('/chat/')[1]?.split('/')[0];
      return chatId ? [chatId] : [];
    }
    return [];
  })();

  const handleSelect = (data: { itemKey?: ItemKey | undefined; domEvent?: MouseEvent | undefined; isOpen?: boolean | undefined }) => {
    const itemKey = data.itemKey;
    router.push(itemKey === itemKeyEnum.new ? '/' : `/chat/${itemKey}`);
  };

  return (
    <div>

      <Nav
        className={styles.nav}
        bodyStyle={{ height: 320 }}
        items={[
          {
            text: '新对话',
            icon: <IconPlusCircle />,
            itemKey: itemKeyEnum.new,
          },
          {
            text: '对话记录',
            icon: <IconArticle />,
            itemKey: itemKeyEnum.chat,
            items: chatHistoryData,
          },
        ]}
        defaultOpenKeys={[itemKeyEnum.chat]}
        selectedKeys={selectedKeys}
        header={{
          logo: <Avatar
            alt="医疗 AI 助手模型头像"
            src={SliderAvatar.src}
            style={{ margin: 4 }}
          />,
          text: '医疗 AI 助手'
        }}
        footer={{
          collapseButton: true,
        }}
        onClick={handleSelect}
      />
    </div>
  );
}