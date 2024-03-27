import { type InteractionDataOption, type DataOptionValue } from "../types";

export function getDataOptionValue<T extends DataOptionValue>(
  options: InteractionDataOption[],
  name: string,
): T | null {
  const option = options.find((option) => option.name === name);
  if (!option) return null;
  return option.value as T;
}
