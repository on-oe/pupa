import { useAbortEffect } from '../hooks/use-abort-effect';
import { apiService } from '../services/api-service';
import { useState } from 'react';
import { TranslateTool } from '../types';

interface TranslationProps {
  text: string;
}

export function Translation({ text }: TranslationProps) {
  const [translation, setTranslation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useAbortEffect(
    (signal) => {
      if (!text) return;
      setLoading(true);
      apiService
        .getTranslation(
          {
            text,
            tool: TranslateTool.Google,
          },
          { signal },
        )
        .then((res) => {
          setTranslation(res.data.text);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [text],
  );

  return (
    <div className="absolute bottom-full w-full">
      <p className=" text-white">{loading ? 'loading...' : translation}</p>
    </div>
  );
}
