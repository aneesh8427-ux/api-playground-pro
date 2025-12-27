import { useState } from 'react';
import { KeyValuePair } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/storage';

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDescription?: boolean;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  showDescription = false,
}: KeyValueEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: generateId(), key: '', value: '', enabled: true },
    ]);
  };

  const updateItem = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: showDescription ? '32px 1fr 1fr 1fr 32px' : '32px 1fr 1fr 32px' }}>
        <div />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          {keyPlaceholder}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
          {valuePlaceholder}
        </span>
        {showDescription && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Description
          </span>
        )}
        <div />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-2 items-center animate-fade-in"
          style={{ gridTemplateColumns: showDescription ? '32px 1fr 1fr 1fr 32px' : '32px 1fr 1fr 32px' }}
        >
          <div className="flex justify-center">
            <Checkbox
              checked={item.enabled}
              onCheckedChange={(checked) =>
                updateItem(item.id, { enabled: !!checked })
              }
            />
          </div>
          <Input
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(e) => updateItem(item.id, { key: e.target.value })}
            className="font-mono text-sm h-9"
          />
          <Input
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(e) => updateItem(item.id, { value: e.target.value })}
            className="font-mono text-sm h-9"
          />
          {showDescription && (
            <Input
              placeholder="Description"
              value={item.description || ''}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
              className="text-sm h-9"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={addItem}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add {keyPlaceholder}
      </Button>
    </div>
  );
}
