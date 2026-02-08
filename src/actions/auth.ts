"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerAction({ userName, password }: { userName: string; password: string }) {

  // 基础校验
  if (!userName || !password) {
    return { success: false, error: "请填写完整的用户名和密码" };
  }

  try {
    // 2. 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { userName },
    });

    if (existingUser) {
      return { success: false, error: "该用户名已被占用" };
    }

    // 3. 密码加密
    // 10 是 saltRounds，既保证了安全又兼顾了性能
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 存入数据库
    await prisma.user.create({
      data: {
        userName,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("注册过程发生错误:", error);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}