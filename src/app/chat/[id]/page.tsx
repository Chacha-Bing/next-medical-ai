import { findMessageHistroy } from '@/actions/sql';
import ChatWrapper from './chatWrapper';
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  const messageHistroyResult = await findMessageHistroy({ chatId: id });
  return (
    <ChatWrapper messageHistroyResult={messageHistroyResult} />
  );
}