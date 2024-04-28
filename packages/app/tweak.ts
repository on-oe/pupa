type RunAt = 'document-start' | 'document-end' | 'document-idle' | 'runtime';

export interface PageTweakDef {
  name: string;
  input: string;
  runAt: RunAt;
  once: boolean;
}

export function definePageTweak(config: {
  name: string;
  input: string;
  runAt?: RunAt;
  once?: boolean;
}): PageTweakDef {
  return {
    ...config,
    runAt: config.runAt || 'runtime',
    once: config.once ?? false,
  };
}
