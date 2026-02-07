// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("1. 收到前端请求内容:", body); // 调试点 1

    const { prompt } = body;

    // 尝试调用 Python 后端
    console.log("2. 准备请求 Python 服务..."); 
    const pyResponse = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!pyResponse.ok) {
        const errorText = await pyResponse.text();
        console.error("3. Python 服务返回错误:", errorText);
        return NextResponse.json({ error: 'Python Service Error' }, { status: pyResponse.status });
    }

    const data = await pyResponse.json();
    console.log("4. Python 返回成功:");

    return NextResponse.json({ result: data.content });

  } catch (error: any) {
    // 关键：把具体的错误打印在终端里
    console.error("❌ 接口发生错误:", error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}