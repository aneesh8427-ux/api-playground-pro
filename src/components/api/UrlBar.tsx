import { Input } from '@/components/ui/input';
import { MethodSelector } from './MethodSelector';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { HttpMethod } from '@/types/api';

interface UrlBarProps {
  method: HttpMethod;
  url: string;
  isLoading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function UrlBar({
  method,
  url,
  isLoading,
  onMethodChange,
  onUrlChange,
  onSend,
}: UrlBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-card border-b border-border">
      <MethodSelector value={method} onChange={onMethodChange} />
      <Input
        type="text"
        placeholder="Enter request URL or paste cURL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 font-mono text-sm bg-background"
      />
      <Button
        onClick={onSend}
        disabled={isLoading || !url.trim()}
        className="gap-2 px-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send
          </>
        )}
      </Button>
    </div>
  );
}
