import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import LabelManager from '@/components/dataset/LabelManager';
import SampleStudio from '@/components/dataset/SampleStudio';

export default function DatasetAdmin() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadLabels = async () => {
    const list = await base44.entities.SignLabel.list('-created_date', 500);
    setLabels(list);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role === 'admin') await loadLabels();
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center max-w-lg mx-auto">
        <ShieldAlert className="h-10 w-10 mx-auto text-amber-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">{t('dataset.adminOnly')}</h1>
        <p className="text-muted-foreground text-sm">{t('dataset.notAdmin')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{t('dataset.title')}</h1>
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <LabelManager labels={labels} selected={selected} onSelect={setSelected} onChange={loadLabels} />
        <div>
          {selected ? (
            <SampleStudio label={selected} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm h-full min-h-[300px] grid place-items-center">
              {t('dataset.selectHint')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}