import type { User } from '@pupa/universal/types';
import { atom } from 'jotai';
import { store } from './store';

export const userAtom = atom<User | null>(null);

export const userStore = {
  setUser: (user: User) => {
    store.set(userAtom, user);
  },
};
