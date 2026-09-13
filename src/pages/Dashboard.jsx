import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hand, Database, Activity, Gauge, Languages, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import moment from 'moment';

export default function Dashboard() {
  const { t, lang } = useLang();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [labelList, sampleList, recordList] = await Promise.all([
          base44.entities.SignLabel.list('-created_date', 500),
          base44.entities.TrainingSample.list('-created_date', 500),
          base44.entities.RecognitionRecord.list('-created_date', 8)
        ]);
        setLabels(labelList);
        setRecent(recordList);
        const avg = recordList.length ? recordList.reduce((s, r) => s + (r.confidence || 0), 0) / recordList.length : 0;
        setStats({ signs: labelList.length, samples: sampleList.length, recognitions: recordList.length, avg });
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subtitle = lang === 'ku' ? t('brand.subtitleKu') : lang === 'ar' ? t('brand.subtitleAr') : t('brand.subtitleEn');

  return (
    <div className="space-y-8">
      <div className="rounded-3xl brand-gradient text-white p-7 md:p-10 shadow-xl shadow-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-white/15 backdrop-blur">
            <Hand className="h-7 w-7" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold tracking-tight">KRD AI</div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-1 text-balance">{subtitle}</h1>
        <p className="text-white/70 text-sm mb-6" dir="rtl">وەرگێڕی زیرەکی زمانی ئاماژەی کوردی</p>
        <Link to="/translate">
          <Button className="bg-white text-primary hover:bg-white/90 gap-2 rounded-2xl h-12 px-6">
            <Camera className="h-5 w-5" />
            {t('dashboard.cta')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Languages} label={t('dashboard.totalSigns')} value={loading ? '—' : stats?.signs ?? 0} />
        <StatCard icon={Database} label={t('dashboard.totalSamples')} value={loading ? '—' : stats?.samples ?? 0} />
        <StatCard icon={Activity} label={t('dashboard.recognitions')} value={loading ? '—' : stats?.recognitions ?? 0} />
        <StatCard icon={Gauge} label={t('dashboard.avgConfidence')} value={loading ? '—' : `${Math.round((stats?.avg ?? 0) * 100)}%`} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">{t('dashboard.recent')}</h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">{t('dashboard.noRecent')}</div>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <div className="text-xl font-bold">{r.word}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{Math.round((r.confidence || 0) * 100)}%</span>
                  <span>{moment(r.created_date).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">{t('dashboard.labelsOverview')}</h2>
        {labels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">{t('dashboard.noLabels')}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => (
              <span key={l.id} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">{l.label_ku}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}