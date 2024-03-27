export function isDevAppId(id: string): boolean {
  return id[0] === "0";
}

export function createId() {
  return Math.random().toString(36).substring(2);
}
