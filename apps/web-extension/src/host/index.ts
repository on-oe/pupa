import { FetchHost } from "./fetch-host";
import { InteractionHost } from "./irc-host";
import { Repository } from "./repository";
import { WsHost } from "./ws-host";

const repository = new Repository();
const ircHost = new InteractionHost(repository);

export const fetchHost = new FetchHost(repository, ircHost);
export const wsHost = new WsHost(repository);
