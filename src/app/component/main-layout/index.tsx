"use client"; // 关键：标记这个组件在客户端运行

import React from 'react';
import { Layout, Button } from '@douyinfe/semi-ui'; // 假设你之后要用 Nav
import SliderDetail from '../sider-detail';
import styles from './index.module.css';
import { useSession, signOut } from "next-auth/react";

const { Header, Footer, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <Layout className="components-layout-demo" style={{ minHeight: '100vh' }}>
      <Sider style={{ width: '300px', background: 'var(--semi-color-fill-2)' }}>
        <SliderDetail />
      </Sider>
      <Layout>
        <Header className={`${styles.common} ${styles.header}`}>
          <span className={styles.greeting}>
            👋🏻 你好，
            <span className={styles.userName}>{session?.user?.name}</span>
          </span>
          <Button
            className={styles.logoutButton}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ height: 'calc(100vh - 128px)' }}>
          {children}
        </Content>
        <Footer className={`${styles.common} ${styles.footer}`}>©茶茶2026 医疗 AI 项目</Footer>
      </Layout>
    </Layout>
  );
}