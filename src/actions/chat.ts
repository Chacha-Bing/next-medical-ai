"use server";

import { appendChatItem, appendMessageItem } from "@/actions/sql";
import { auth } from "@/auth";
import { Role } from "@/types";
import { revalidatePath } from "next/cache";

export async function creatChatItemAndFlash({ chatId, title }: { chatId: string; title: string }) {
  const session = await auth();
  const res = await appendChatItem({
    chatId,
    title,
    userId: session?.user?.id || 'unknown_user',
  });
  if (res.success) {
    revalidatePath("/");
  }
}

export async function appendMessageItemAndFlash({ chatId, role, content }: { chatId: string; role: Role; content: string }) {
  const res = await appendMessageItem({ chatId, role, content });
  if (res.success) {
    revalidatePath(`/chat/${chatId}`);
  }
}

export async function askAiAction(prompt: string) {
  try {
    // 注意：这里是在服务器上运行，可以直接访问内网地址
    const response = await fetch(`${process.env.PYTHON_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
      }),
    });

    if (!response.ok) {
      return { error: `服务器响应异常: ${response.status}` };
    }

    const data = await response.json();
    
    // 假设 Python 返回 { result: "..." }
    return { 
      data: {
        role: Role.ASSISTANT,
        content: data.content,
        duration: data.duration,
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Python API 调用失败:", error);
    return { error: "AI 助手暂时无法响应" };
  }
}