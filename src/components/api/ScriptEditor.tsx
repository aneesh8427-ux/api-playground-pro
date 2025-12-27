import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Info } from 'lucide-react';

interface ScriptEditorProps {
  script: string;
  onChange: (script: string) => void;
  type: 'pre-request' | 'test';
}

export function ScriptEditor({ script, onChange, type }: ScriptEditorProps) {
  const placeholder = type === 'pre-request' 
    ? `// Pre-request script runs before the request is sent
// You can modify request variables here

// Example:
// const timestamp = Date.now();
// pm.variables.set("timestamp", timestamp);`
    : `// Test script runs after the response is received
// You can write assertions here

// Example:
// pm.test("Status is 200", function() {
//   pm.expect(pm.response.status).to.equal(200);
// });
//
// pm.test("Response has data", function() {
//   const json = pm.response.json();
//   pm.expect(json).to.have.property("data");
// });`;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            {type === 'pre-request' ? 'Pre-request Script' : 'Test Script'}
          </p>
          <p>
            {type === 'pre-request'
              ? 'This script runs before the request is sent. Use it to set variables or modify the request.'
              : 'This script runs after the response is received. Use it to validate the response and run assertions.'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">JavaScript</Label>
        <Textarea
          placeholder={placeholder}
          value={script}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm min-h-[300px] resize-y bg-background"
          spellCheck={false}
        />
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Scripts run in a sandboxed environment. Available globals: <code className="text-primary">pm</code>, <code className="text-primary">console</code>
        </p>
      </div>
    </div>
  );
}
