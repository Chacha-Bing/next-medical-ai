"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Form, Button, Toast } from "@douyinfe/semi-ui";
import { IconUser, IconLock, IconMail } from "@douyinfe/semi-icons";
import styles from "./page.module.css";
import { registerAction } from "@/actions/auth";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        userName: values.userName,
        password: values.password,
        redirect: true,
        callbackUrl: "/",
      });
      
      if (result?.error) {
        alert("登录失败，请检查用户名和密码");
      }
    } catch (error) {
      alert("登录出错，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await registerAction(values);

      if (response.success) {
        alert("注册成功！请登录");
        setIsLogin(true);
      } else {
        alert(response.error || "注册失败");
      }
    } catch (error) {
      alert("注册出错，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* 卡片容器 */}
        <div className={styles.card}>
          {/* 头部装饰 */}
          <div className={styles.headerDecoration}></div>
          
          {/* 主要内容区域 */}
          <div className={styles.content}>
            {/* Logo 和标题 */}
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <IconUser size="extra-large" style={{ color: "white" }} />
              </div>
              <h1 className={styles.title}>
                {isLogin ? "欢迎回来" : "创建账户"}
              </h1>
              <p className={styles.subtitle}>
                {isLogin
                  ? "登录以继续使用医疗AI系统"
                  : "注册开始您的医疗AI之旅"}
              </p>
            </div>

            {/* 切换按钮 */}
            <div className={styles.toggleContainer}>
              <button
                className={`${styles.toggleButton} ${isLogin ? styles.active : ""}`}
                onClick={() => setIsLogin(true)}
              >
                登录
              </button>
              <button
                className={`${styles.toggleButton} ${!isLogin ? styles.active : ""}`}
                onClick={() => setIsLogin(false)}
              >
                注册
              </button>
            </div>

            {/* 登录表单 */}
            {isLogin ? (
              <div className={styles.formContainer}>
                <Form onSubmit={handleLogin} key="login">
                  <Form.Input
                    field="userName"
                    label="用户名"
                    placeholder="请输入用户名"
                    prefix={<IconUser />}
                    rules={[{ required: true, message: "请输入用户名" }]}
                  />
                  <Form.Input
                    field="password"
                    label="密码"
                    type="password"
                    placeholder="请输入密码"
                    prefix={<IconLock />}
                    rules={[{ required: true, message: "请输入密码" }]}
                  />
                  
                  <div className={styles.checkboxRow}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" />
                      记住我
                    </label>
                    <a href="#" className={styles.forgotLink}>
                      忘记密码？
                    </a>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? "登录中..." : "登录"}
                  </button>
                </Form>
              </div>
            ) : (
              /* 注册表单 */
              <div className={styles.formContainer}>
                <Form onSubmit={handleRegister} key="register">
                  <Form.Input
                    field="userName"
                    label="用户名"
                    placeholder="请输入用户名"
                    prefix={<IconUser />}
                    rules={[
                      { required: true, message: "请输入用户名" },
                      { min: 3, message: "用户名至少3个字符" },
                    ]}
                  />
                  <Form.Input
                    field="password"
                    label="密码"
                    type="password"
                    placeholder="请输入密码"
                    prefix={<IconLock />}
                    rules={[
                      { required: true, message: "请输入密码" },
                      { min: 6, message: "密码至少6个字符" },
                    ]}
                  />
                  <Form.Input
                    field="confirmPassword"
                    label="确认密码"
                    type="password"
                    placeholder="请再次输入密码"
                    prefix={<IconLock />}
                    rules={[
                      { required: true, message: "请确认密码" },
                      {
                        validator: (rule: any, value: any) => {
                          if (!rule.formApi) {
                            return true;
                          }
                          const password = rule.formApi.getValue("password");
                          if (value && password && value !== password) {
                            return "两次密码输入不一致";
                          }
                          return true;
                        },
                      },
                    ]}
                  />

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? "注册中..." : "注册"}
                  </button>
                </Form>
              </div>
            )}

            {/* 底部提示 */}
            <div className={styles.bottomText}>
              {isLogin ? (
                <p>
                  还没有账户？
                  <button
                    onClick={() => setIsLogin(false)}
                    className={styles.bottomLink}
                  >
                    立即注册
                  </button>
                </p>
              ) : (
                <p>
                  已有账户？
                  <button
                    onClick={() => setIsLogin(true)}
                    className={styles.bottomLink}
                  >
                    立即登录
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className={styles.footer}>
          <p>© 2026 医疗AI系统. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}