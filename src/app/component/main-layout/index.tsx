"use client"; // 关键：标记这个组件在客户端运行

import React from 'react';
import { Layout, Nav } from '@douyinfe/semi-ui'; // 假设你之后要用 Nav
import SliderDetail from '../sider-detail';
import styles from './index.module.css';

const { Header, Footer, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <Layout className="components-layout-demo" style={{ minHeight: '100vh' }}>
      <Sider style={{ width: '300px', background: 'var(--semi-color-fill-2)' }}>
        <SliderDetail />
      </Sider>
      <Layout>
        <Header className={styles.common}>医疗 AI 助手导航栏</Header>
        <Content style={{ height: 'calc(100vh - 128px)' }}>
          {children}
        </Content>
        <Footer className={`${styles.common} ${styles.footer}`}>©茶茶2026 医疗 AI 项目</Footer>
      </Layout>
    </Layout>
  );
}