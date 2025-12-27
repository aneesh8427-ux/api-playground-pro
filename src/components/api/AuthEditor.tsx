import { AuthConfig, AuthType } from '@/types/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

const authTypes: { value: AuthType; label: string }[] = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'apiKey', label: 'API Key' },
];

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const handleTypeChange = (type: AuthType) => {
    const newAuth: AuthConfig = { type };
    
    if (type === 'bearer') {
      newAuth.bearer = { token: '' };
    } else if (type === 'basic') {
      newAuth.basic = { username: '', password: '' };
    } else if (type === 'apiKey') {
      newAuth.apiKey = { key: '', value: '', addTo: 'header' };
    }
    
    onChange(newAuth);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Auth Type</Label>
        <Select value={auth.type} onValueChange={(v) => handleTypeChange(v as AuthType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {authTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {auth.type === 'bearer' && (
        <div className="space-y-2 animate-fade-in">
          <Label>Token</Label>
          <Input
            type="password"
            placeholder="Enter bearer token"
            value={auth.bearer?.token || ''}
            onChange={(e) =>
              onChange({ ...auth, bearer: { token: e.target.value } })
            }
            className="font-mono"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="Username"
              value={auth.basic?.username || ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  basic: { ...auth.basic!, username: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={auth.basic?.password || ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  basic: { ...auth.basic!, password: e.target.value },
                })
              }
            />
          </div>
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              placeholder="e.g., X-API-Key"
              value={auth.apiKey?.key || ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  apiKey: { ...auth.apiKey!, key: e.target.value },
                })
              }
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              type="password"
              placeholder="Enter API key value"
              value={auth.apiKey?.value || ''}
              onChange={(e) =>
                onChange({
                  ...auth,
                  apiKey: { ...auth.apiKey!, value: e.target.value },
                })
              }
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Add to</Label>
            <RadioGroup
              value={auth.apiKey?.addTo || 'header'}
              onValueChange={(v) =>
                onChange({
                  ...auth,
                  apiKey: { ...auth.apiKey!, addTo: v as 'header' | 'query' },
                })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="header" id="header" />
                <Label htmlFor="header" className="font-normal cursor-pointer">
                  Header
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="query" id="query" />
                <Label htmlFor="query" className="font-normal cursor-pointer">
                  Query Params
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {auth.type === 'none' && (
        <p className="text-sm text-muted-foreground">
          This request does not use any authorization.
        </p>
      )}
    </div>
  );
}
