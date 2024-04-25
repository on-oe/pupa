import { CommandType, PageRecycleEvent, type Command } from "@pupa/universal/types";
import type { InteractionContext } from "./interaction";

export interface Commander extends Command {
  execute: (interaction: InteractionContext) => Promise<void>;
}

type CommandConfig = Omit<Commander, "type" | "id">;

export function defineSlashCommand(config: CommandConfig): Commander {
  return {
    ...config,
    type: CommandType.CHAT_INPUT,
  };
}

export function definePageFuncCommand(config: CommandConfig): Commander {
  return {
    ...config,
    type: CommandType.PAGE_FUNCTION,
  };
}

export function definePageRecycleCommand(event: PageRecycleEvent, config: Omit<CommandConfig, 'name'>): Commander {
  return {
    ...config,
    name: event,
    type: CommandType.PAGE_RECYCLE,
  };
}