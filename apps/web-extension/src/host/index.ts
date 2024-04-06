import { FetchHost } from "./fetch-host";
import { InteractionHost } from "./irc-host";
import { Repository } from "./repository";
import { messageService } from "./services/message.service";
import { WsHost } from "./ws-host";

const repository = new Repository();
const ircHost = new InteractionHost(messageService);

export const fetchHost = new FetchHost(repository, ircHost);
export const wsHost = new WsHost(repository);
