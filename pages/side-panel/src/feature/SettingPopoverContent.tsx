import { Button, Input, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@extension/ui';
import { AlertTriangle, EyeOff, Eye, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStorage } from '@extension/shared';
import { apiKeyStorage, apiVersionStorage, temperatureStorage } from '@extension/storage';
import type React from 'react';
import { useI18n } from '@/hooks/useI18n';
import { CopyButton } from '../components/CopyButton';
import { motion } from 'framer-motion';

export const SettingPopoverContent = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
  const [showKey, setShowKey] = useState(false);
  const [pasted, setPasted] = useState(false);

  const apiVersion = useStorage(apiVersionStorage);
  const apiKey = useStorage(apiKeyStorage);
  const temperatureFromStorage = useStorage(temperatureStorage);

  const [temperature, setTemperature] = useState(temperatureFromStorage);

  useEffect(() => {
    temperatureStorage.set(temperature);
  }, [temperature]);

  const inputRef = useRef<HTMLInputElement>(null);

  const { API_KEY_SETTING, PLEASE_SET_API_KEY, SAVE, PRECISE, CREATIVE, TEMPERATURE, BALANCE } = useI18n();

  const handleClosePopover = () => {
    setIsOpen(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData;
    if (clipboardData) {
      const pastedData = clipboardData.getData('text');
      apiKeyStorage.set(pastedData);

      setPasted(true);

      setTimeout(() => {
        setPasted(false);
      }, 2000);
    }
  };

  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const handleDelete = () => {
    apiKeyStorage.set('');
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-slate-800 dark:text-slate-200 text-sm">{API_KEY_SETTING}</h3>
      {!apiKey && (
        <div className="text-red-500 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {PLEASE_SET_API_KEY}
        </div>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type={showKey ? 'text' : 'password'}
          placeholder="OpenAI API Key"
          value={apiKey}
          readOnly
          onPaste={handlePaste}
          onClick={handleInputClick}
          className={`${apiKey ? 'pr-20' : 'pr-10'}  ${pasted && 'border-2 border-[#8b5cf6] focus-visible:ring-0'} 
            bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 cursor-pointer`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            data-testid="eye-icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          {apiKey && <CopyButton handleCopyText={handleCopyKey} />}
        </div>
      </div>
      <Select value={apiVersion} onValueChange={apiVersionStorage.set}>
        <SelectTrigger className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          <SelectValue placeholder="Select API Version" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
          <SelectItem value="gpt-4.1-nano">GPT-4.1-nano</SelectItem>
          <SelectItem value="gpt-4.1-mini">GPT-4.1-mini</SelectItem>
        </SelectContent>
      </Select>
      <div className="space-y-4 !mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{TEMPERATURE}</span>
          <motion.span
            key={temperature}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm tabular-nums font-medium"
          >
            {temperature}
          </motion.span>
        </div>
        <div className="relative !mt-2">
          <Slider value={[temperature]} onValueChange={([value]) => setTemperature(value)} max={2} min={0} step={0.1} />
          <div className="flex justify-between mt-2 text-muted-foreground">
            <span>{PRECISE}</span>
            <span>{BALANCE}</span>
            <span>{CREATIVE}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={!apiKey}
          data-testid="save-icon"
          className="flex-1  text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 
          bg-[#8b5cf6] hover:bg-[#7c3aed] dark:bg-[#a78bfa] dark:hover:bg-[#9061f9]"
          onClick={handleClosePopover}
        >
          {SAVE}
        </Button>
        {apiKey && (
          <Button
            data-testid="delete-api-icon"
            variant="outline"
            size="icon"
            className="border-[#f87171] dark:border-[#ef4444] text-[#ef4444] dark:text-[#f87171] hover:bg-[#fee2e2] dark:hover:bg-[#450a0a]/20 hover:text-[#dc2626] dark:hover:text-[#ef4444]"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
