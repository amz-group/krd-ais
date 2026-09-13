import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LabelManager({ labels, selected, onSelect, onChange }) {
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label_ku: '', label_en: '', label_ar: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState({});

  const refreshCounts = async () => {
    try {
      const samples = await base44.entities.TrainingSample.list('-created_date', 1000);
      const c = {};
      samples.forEach((s) => { c[s.label_id] = (c[s.label_id] || 0) + 1; });
      setCounts(c);
    } catch (e) {}
  };

  useEffect(() => { refreshCounts(); }, [labels]);

  const submit = async () => {
    if (!form.label_ku.trim()) return;
    setSaving(true);
    try {
      await base44.entities.SignLabel.create(form);
      setForm({ label_ku: '', label_en: '', label_ar: '', description: '' });
      setAdding(false);
      await onChange();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const remove = async (label) => {
    if (!confirm(t('dataset.deleteLabelConfirm'))) return;
    await base44.entities.TrainingSample.deleteMany({ label_id: label.id });
    await base44.entities.SignLabel.delete(label.id);
    if (selected?.id === label.id) onSelect(null);
    await onChange();
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{t('dataset.labels')}</h2>
        <Button size="sm" onClick={() => setAdding((a) => !a)} className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> {t('dataset.addLabel')}
        </Button>
      </div>

      {adding && (
        <div className="space-y-2 rounded-2xl border border-border p-3 bg-secondary/30">
          <Input placeholder={t('dataset.labelKu')} value={form.label_ku} onChange={(e) => setForm({ ...form, label_ku: e.target.value })} />
          <Input placeholder={t('dataset.labelEn')} value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} />
          <Input placeholder={t('dataset.labelAr')} value={form.label_ar} onChange={(e) => setForm({ ...form, label_ar: e.target.value })} />
          <Input placeholder={t('dataset.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saving} className="gap-2 rounded-xl flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {t('common.save')}
            </Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="rounded-xl">{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-[60vh] overflow-auto">
        {labels.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t('dataset.noLabels')}</p>}
        {labels.map((l) => (
          <div key={l.id} className={`flex items-center justify-between gap-2 rounded-2xl p-3 cursor-pointer transition ${selected?.id === l.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`} onClick={() => onSelect(l)}>
            <div className="min-w-0">
              <div className="font-bold truncate">{l.label_ku}</div>
              <div className={`text-xs ${selected?.id === l.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{counts[l.id] || 0} {t('dataset.sampleCount')}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(l); }} className="shrink-0 rounded-full">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}