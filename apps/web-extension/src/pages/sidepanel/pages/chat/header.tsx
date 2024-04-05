import { useSnapshot } from "valtio";
import { store } from "./store";

export function Header() {
  const { currentChannel } = useSnapshot(store.state);

  return <h2 className="text-xl">{currentChannel?.name || "New Chat"}</h2>;
}
