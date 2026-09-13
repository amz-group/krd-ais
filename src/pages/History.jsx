import React, { useEffect, useState } from 'react';
import { Trash2, Camera, Upload, History as HistoryIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import moment from 'moment';

export default function History() {
  const { t } = useLang();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const list = await base44.entities.RecognitionRecord.filter({ created_by_id: me.id }, '-created_date', 200);
      setRecords(list);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.RecognitionRecord.delete(id);
    setRecords((r) => r.filter((x) => x.id !== id));
  };

  const clearAll = async () => {
    if (!confirm(t('history.clearConfirm'))) return;
    const me = await base44.auth.me();
    await base44.entities.RecognitionRecord.deleteMany({ created_by_id: me.id });
    setRecords([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{t('history.title')}</h1>
        {records.length > 0 && (
          <Button variant="outline" onClick={clearAll} className="gap-2 rounded-xl">
            <Trash2 className="h-4 w-4" /> {t('history.clear')}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">{t('common.loading')}</div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <HistoryIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('history.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-secondary text-secondary-foreground shrink-0">
                  {r.source === 'upload' ? <Upload className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold truncate">{r.word}</div>
                  <div className="text-xs text-muted-foreground">{moment(r.created_date).format('YYYY-MM-DD HH:mm')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-sm">{Math.round((r.confidence || 0) * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} className="rounded-full">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}