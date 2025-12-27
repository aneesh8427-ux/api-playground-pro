import { RequestBody, BodyType, KeyValuePair } from '@/types/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { KeyValueEditor } from './KeyValueEditor';
import { Label } from '@/components/ui/label';

interface BodyEditorProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

const bodyTypes: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'raw', label: 'Raw' },
];

export function BodyEditor({ body, onChange }: BodyEditorProps) {
  const handleTypeChange = (type: BodyType) => {
    const newBody: RequestBody = { type };
    
    if (type === 'json' || type === 'raw') {
      newBody.raw = body.raw || '';
    } else if (type === 'form-data') {
      newBody.formData = body.formData || [];
    } else if (type === 'x-www-form-urlencoded') {
      newBody.urlencoded = body.urlencoded || [];
    }
    
    onChange(newBody);
  };

  const handleRawChange = (raw: string) => {
    onChange({ ...body, raw });
  };

  const handleFormDataChange = (formData: KeyValuePair[]) => {
    onChange({ ...body, formData });
  };

  const handleUrlencodedChange = (urlencoded: KeyValuePair[]) => {
    onChange({ ...body, urlencoded });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Body Type</Label>
        <Select value={body.type} onValueChange={(v) => handleTypeChange(v as BodyType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bodyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {body.type === 'none' && (
        <p className="text-sm text-muted-foreground">
          This request does not have a body.
        </p>
      )}

      {(body.type === 'json' || body.type === 'raw') && (
        <div className="space-y-2 animate-fade-in">
          <Label>{body.type === 'json' ? 'JSON Body' : 'Raw Body'}</Label>
          <Textarea
            placeholder={body.type === 'json' ? '{\n  "key": "value"\n}' : 'Enter raw body content'}
            value={body.raw || ''}
            onChange={(e) => handleRawChange(e.target.value)}
            className="font-mono text-sm min-h-[200px] resize-y"
          />
        </div>
      )}

      {body.type === 'form-data' && (
        <div className="animate-fade-in">
          <KeyValueEditor
            items={body.formData || []}
            onChange={handleFormDataChange}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
          />
        </div>
      )}

      {body.type === 'x-www-form-urlencoded' && (
        <div className="animate-fade-in">
          <KeyValueEditor
            items={body.urlencoded || []}
            onChange={handleUrlencodedChange}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
          />
        </div>
      )}
    </div>
  );
}
