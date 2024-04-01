import { GetInstalledAppsEvent } from "@shared/bridge/events/application";
import { builtInAppWithCommands } from "@shared/built-in-app";
import type {
  Application,
  ApplicationWithCommands,
  Command,
} from "@pupa/universal/types";
import { useEffect, useState } from "react";
import { bridge } from "../bridge";

export function useApplication() {
  // only new channel will show local dev apps
  const [applications, setApplications] = useState<ApplicationWithCommands[]>(
    [],
  );

  useEffect(() => {
    const fetchApplication = async () => {
      const applications = await bridge.send<Application[]>(
        GetInstalledAppsEvent.create(),
      );
      fetchCommands(applications)
        .then((apps) => {
          setApplications([...apps, builtInAppWithCommands]);
        })
        .catch(() => {
          setApplications([builtInAppWithCommands]);
        });
    };

    fetchApplication();
  }, []);

  return { applications } as const;
}

function fetchCommand(app: Application): Promise<Command[]> {
  const url = app.interactions_endpoint_url;
  return fetch(`${url}/commands`).then((res) => res.json());
}

async function fetchCommands(apps: Application[]) {
  const list = await Promise.all(apps.map(fetchCommand));
  return list.map((commands, i) => ({
    ...apps[i],
    commands,
  }));
}
