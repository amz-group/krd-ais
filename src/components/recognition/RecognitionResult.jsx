import React from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';

export default function RecognitionResult({ result, onSpeak, speaking, disabled }) {
  const { t } = useLang();
  const pct = result && typeof result.confidence === 'number' ? Math.round(result.confidence * 100) : null;
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      {result && result.prediction ? (
        <>
          <div className="text-5xl font-extrabold tracking-tight mb-4 break-words">{result.prediction}</div>
          {pct !== null && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">{t('translate.confidence')}</span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full brand-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          <Button onClick={() => onSpeak(result.prediction)} disabled={speaking || disabled} className="w-full gap-2 rounded-2xl h-12 text-base">
            {speaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
            {speaking ? t('translate.speaking') : t('translate.speak')}
          </Button>
        </>
      ) : (
        <div className="text-muted-foreground text-sm py-10 text-center">{t('translate.idle')}</div>
      )}
    </div>
  );
}