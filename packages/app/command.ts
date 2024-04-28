import { CommandType, type Command } from '@pupa/universal/types';
import type { InteractionContext } from './interaction';

export interface Commander extends Command {
  execute: (interaction: InteractionContext) => Promise<void>;
}

type CommandConfig = Omit<Commander, 'type' | 'id'>;

export function defineSlashCommand(config: CommandConfig): Commander {
  return {
    ...config,
    type: CommandType.CHAT_INPUT,
  };
}
