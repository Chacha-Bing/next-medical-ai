import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // 1. 定义登录逻辑
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) return null;

        // 从数据库查用户
        const user = await prisma.user.findUnique({
          where: { userName: credentials.userName as string },
        });

        if (!user) return null;

        // 验证密码
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        // 验证成功，返回用户信息（会被存入 Token）
        return { id: user.id, name: user.userName };
      },
    }),
  ],
  // 2. 自定义登录页面路径
  pages: {
    signIn: "/login",
  },
  // 3. 回调函数：决定 Session 里包含什么
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});