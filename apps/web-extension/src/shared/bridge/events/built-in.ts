import { defineBridgeEvent } from "../define-bridge-event";

export const enum BuiltInEventType {
  InstallDevApp = "InstallDevApp",
}

export const InstallDevAppEvent = defineBridgeEvent<{ port: number }>(
  BuiltInEventType.InstallDevApp,
);
