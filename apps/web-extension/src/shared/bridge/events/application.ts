import type {
  ApplicationWithCommands,
  InteractionData,
} from '@pupa/universal/types';
import { defineBridgeEvent } from '../define-bridge-event';

export const GetInstalledAppsEvent = defineBridgeEvent('GetInstalledApps');

export const ExecSlashCommandEvent = defineBridgeEvent<{
  applicationId: string;
  channelId: string;
  data: InteractionData;
}>('ExecSlashCommand');

export const RefreshInstalledAppsEvent = defineBridgeEvent(
  'RefreshInstalledApps',
);

export const AddOrUpdateAppEvent =
  defineBridgeEvent<ApplicationWithCommands>('AddOrUpdateApp');

export const RemoveAppEvent = defineBridgeEvent<string>('RemoveApp');
