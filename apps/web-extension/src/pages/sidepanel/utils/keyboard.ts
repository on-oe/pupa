export function isEnterKey(e: React.KeyboardEvent<HTMLElement>) {
  return e.key === "Enter" && !e.repeat;
}
