import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'ku', label: 'کوردی' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' }
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl" aria-label="language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="gap-2">
            {lang === l.code ? <Check className="h-4 w-4 text-primary" /> : <span className="w-4" />}
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}