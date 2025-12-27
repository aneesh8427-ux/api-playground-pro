import { ApiResponse } from '@/types/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Clock, Database, FileText } from 'lucide-react';

interface ResponseViewerProps {
  response: ApiResponse | null;
  isLoading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-success';
  if (status >= 300 && status < 400) return 'status-redirect';
  if (status >= 400 && status < 500) return 'status-client-error';
  if (status >= 500) return 'status-server-error';
  return 'text-muted-foreground';
}

function highlightJson(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-card">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full bg-card">
        <div className="text-center space-y-2 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No response yet</h3>
          <p className="text-sm text-muted-foreground">
            Enter a URL and click Send to make a request
          </p>
        </div>
      </div>
    );
  }

  const isJson = response.headers['content-type']?.includes('application/json');

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-4 p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className={cn('font-mono font-bold text-lg', getStatusClass(response.status))}>
            {response.status}
          </span>
          <span className="text-muted-foreground">{response.statusText}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{formatTime(response.time)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            <span>{formatBytes(response.size)}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-3 h-10">
          <TabsTrigger value="body" className="data-[state=active]:bg-muted rounded-b-none">
            Body
          </TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:bg-muted rounded-b-none">
            Headers ({Object.keys(response.headers).length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto scrollbar-thin">
          <TabsContent value="body" className="m-0 h-full">
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap break-all">
              {isJson ? highlightJson(response.body) : response.body}
            </pre>
          </TabsContent>
          <TabsContent value="headers" className="m-0 p-4">
            <div className="space-y-1">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 font-mono text-sm py-1 border-b border-border/50">
                  <span className="text-primary font-medium min-w-[200px]">{key}:</span>
                  <span className="text-muted-foreground break-all">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
