import type { Command } from '@pupa/universal/types';
import { useAtomValue } from 'jotai';
import { applicationStore, applicationsAtom } from '../store';
import { useEffect, useState } from 'react';

export function useApplication() {
  const applications = useAtomValue(applicationsAtom);

  return {
    applications,
    getApplication: applicationStore.getApplication,
    getAppCommand: applicationStore.getAppCommand,
  };
}
