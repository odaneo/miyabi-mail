import { useStorage } from '@extension/shared';
import { apiKeyStorage, apiVersionStorage, temperatureStorage } from '@extension/storage';
import { useOpenStore } from '@/store/openStore';
import OpenAI, { APIConnectionError, APIError, RateLimitError } from 'openai';
import { useCallback, useState } from 'react';

export const useOpenAIAction = (inputText: string) => {
  const { setIsOpen } = useOpenStore();

  const apiKey = useStorage(apiKeyStorage);
  const apiVersion = useStorage(apiVersionStorage);
  const temperature = useStorage(temperatureStorage);

  const [errorMsg, setErrorMsg] = useState('');

  const runOpenAIAction = useCallback(
    async ({
      prompt,
      onStart,
      onFinish,
      onError,
      onSuccess,
    }: {
      prompt: string;
      onStart?: () => void;
      onFinish?: () => void;
      onError?: (error: Error) => void;
      onSuccess?: (content: string) => void;
    }) => {
      if (!apiKey) {
        setIsOpen(true);
        return;
      }
      if (!inputText) {
        return;
      }
      setErrorMsg('');
      try {
        onStart?.();
        const client = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true,
          baseURL: 'https://miyabi.odaneo.workers.dev',
        });
        const resp = await client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: apiVersion,
          temperature,
        });
        onSuccess?.(resp.choices[0]?.message?.content || '');
      } catch (e: unknown) {
        if (e instanceof APIConnectionError) {
          setErrorMsg('Failed to connect to OpenAI API: ' + e.message);
        } else if (e instanceof RateLimitError) {
          setErrorMsg('OpenAI API request exceeded rate limit: ' + e.message);
        } else if (e instanceof APIError) {
          setErrorMsg('OpenAI API returned an API Error: ' + e.message);
        } else {
          setErrorMsg('An unknown error occurred:' + e);
        }
        onError?.(e as Error);
      } finally {
        onFinish?.();
      }
    },
    [apiKey, inputText, apiVersion, temperature],
  );

  return [errorMsg, setErrorMsg, runOpenAIAction] as const;
};
