"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/types";

// 数据库交互相关

export async function findChatHistroy({ userId }: { userId: string }) {
  try {
    const chatHistroy =  await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: chatHistroy };
  } catch (error) {
    console.error("数据库操作发生错误:", error);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}

export async function findMessageHistroy({ chatId }: { chatId: string }) {
  try {
    const messageHistroy =  await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: messageHistroy };
  } catch (error) {
    console.error("数据库操作发生错误:", error);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}

export async function appendChatItem({ chatId, title, userId }: { chatId: string; title: string; userId: string }) {
  // 基础校验
  if (!chatId || !userId) {
    return { success: false, error: "请传入完整的userId和userId" };
  }

  try {
    // 2. 检查会话是否已存在（一般情况下不会走到这一步，这只是个兜底逻辑）
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (existingChat) {
      return { success: false, error: "该会话已经存在" };
    }
    
    await prisma.chat.create({
      data: {
        id: chatId,
        title,
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("数据库操作发生错误:", error);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}

export async function appendMessageItem({ chatId, role, content }: { chatId: string; role: Role; content: string }) {
  try {
    await prisma.message.create({
      data: {
        chatId,
        role,
        content,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("数据库操作发生错误:", error);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}
