export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
};

export type chatHistroyType = {
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}[]