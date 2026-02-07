"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Nav } from '@douyinfe/semi-ui';
import { ItemKey } from '@douyinfe/semi-ui/lib/es/navigation';
import { IconArticle, IconPlusCircle } from '@douyinfe/semi-icons';
import SliderAvatar from "@/public/avatar.jpg"
import styles from './index.module.css';

const itemKeyEnum = {
  new: 'new',
  chat: 'chat',
};

export default function SliderDetail() {
  const router = useRouter();
  const pathname = usePathname();

  const mockChatHistoryData = [
    {
      text: '关于感冒的咨询',
      itemKey: '111',
    },
    {
      text: '头痛的咨询',
      itemKey: '222',
    },
  ];

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
            items: mockChatHistoryData,
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