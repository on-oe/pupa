import type { Command } from '@pupa/universal/types';
import { useAtomValue } from 'jotai';
import { applicationStore, applicationsAtom } from '../store';
import { useEffect, useState } from 'react';

export function useApplication() {
  const applications = useAtomValue(applicationsAtom);
  const [allCommands, setAllCommands] = useState<
    (Command & { applicationId: string })[]
  >([]);

  useEffect(() => {
    setAllCommands(
      applications.flatMap((app) =>
        app.commands.map((cmd) => ({ applicationId: app.id, ...cmd })),
      ),
    );
  }, [applications]);

  return {
    applications,
    allCommands,
    getApplication: applicationStore.getApplication,
    getAppCommand: applicationStore.getAppCommand,
  };
}
