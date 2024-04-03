import type { Message } from ".";

export interface Channel {
  id: string;
  name?: string;
  last_message?: Message;
  created_at: number;
  updated_at?: number;
}
