import { HttpMethod } from '@/types/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const methodStyles: Record<HttpMethod, string> = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  PATCH: 'text-method-patch',
  DELETE: 'text-method-delete',
};

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as HttpMethod)}>
      <SelectTrigger 
        className={cn(
          'w-[110px] font-mono font-semibold text-sm border-0 bg-secondary/50 focus:ring-1',
          methodStyles[value]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {methods.map((method) => (
          <SelectItem
            key={method}
            value={method}
            className={cn('font-mono font-semibold', methodStyles[method])}
          >
            {method}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
