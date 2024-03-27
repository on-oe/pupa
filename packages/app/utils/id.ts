import * as crypto from "node:crypto";

export function createAppId(name: string) {
  const type = 0;
  const hash = crypto.createHash("sha256").update(name).digest("hex");
  const nameHash = BigInt(`0x${hash.substring(0, 15)}`);
  const id = BigInt(type.toString() + nameHash.toString());
  return id.toString();
}
