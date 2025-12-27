import { HttpMethod } from '@/types/api';
import { cn } from '@/lib/utils';

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
  size?: 'sm' | 'md';
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PUT: 'method-put',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

export function MethodBadge({ method, className, size = 'md' }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'method-badge',
        methodColors[method],
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        className
      )}
    >
      {method}
    </span>
  );
}
