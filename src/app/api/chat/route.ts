import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  // 1. 调用 Python (注意这里不要 .json()，直接转发 body 流)
  const pyRes = await fetch(`${process.env.PYTHON_API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  // 2. 将 Python 的流直接透传给浏览器
  return new Response(pyRes.body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}