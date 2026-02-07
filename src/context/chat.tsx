"use client";

import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext<{
  pendingMessage: string;
  setPendingMessage: (msg: string) => void;
} | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [pendingMessage, setPendingMessage] = useState("");
  return (
    <ChatContext.Provider value={{ pendingMessage, setPendingMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};