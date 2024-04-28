import { Train } from './components/train';
import { useEffect, useState } from 'react';
import { onSettingsChange } from '@pupa/tweak';

export function TrainApp() {
  const [training, setTraining] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (settings: any) => {
      setTraining(settings.training);
    };
    const off = onSettingsChange(handler);

    return () => {
      off();
    };
  }, []);
  return training ? <Train /> : null;
}
