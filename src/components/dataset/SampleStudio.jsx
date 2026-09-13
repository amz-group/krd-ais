import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Upload, Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import CameraView from '@/components/recognition/CameraView';
import { Image } from '@/components/ui/image';

export default function SampleStudio({ label }) {
  const { t } = useLang();
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const cameraRef = useRef(null);
  const fileRef = useRef(null);

  const load = async () => {
    const list = await base44.entities.TrainingSample.filter({ label_id: label.id }, '-created_date', 200);
    setSamples(list);
  };

  useEffect(() => { load(); }, [label.id]);

  const createSample = async (fileUrl, mediaType) => {
    await base44.entities.TrainingSample.create({ label_id: label.id, label_ku: label.label_ku, file_url: fileUrl, media_type: mediaType });
    setToast(t('dataset.captured'));
    setTimeout(() => setToast(''), 1500);
    await load();
  };

  const capture = async () => {
    if (!cameraRef.current) return;
    setBusy(true);
    try {
      const frame = cameraRef.current.captureFrame();
      if (!frame) return;
      const blob = await (await fetch(frame)).blob();
      const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
      const up = await base44.integrations.Core.UploadPublicFile({ file });
      await createSample(up.file_url, 'image');
    } catch (e) {
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (f) => {
    setBusy(true);
    try {
      const isVideo = f.type.startsWith('video');
      const up = await base44.integrations.Core.UploadPublicFile({ file: f });
      await createSample(up.file_url, isVideo ? 'video' : 'image');
    } catch (e) {
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s) => {
    if (!confirm(t('dataset.deleteSampleConfirm'))) return;
    await base44.entities.TrainingSample.delete(s.id);
    setSamples((list) => list.filter((x) => x.id !== s.id));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl brand-gradient text-white p-5">
        <div className="text-sm opacity-80">{t('dataset.samples')}</div>
        <div className="text-3xl font-extrabold">{label.label_ku}</div>
        <div className="text-sm mt-1 opacity-80">{samples.length} {t('dataset.sampleCount')}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {recording ? (
            <CameraView ref={cameraRef} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border aspect-[4/3] grid place-items-center text-center p-6">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => setRecording((r) => !r)} variant={recording ? 'destructive' : 'default'} className="flex-1 gap-2 rounded-2xl">
              <Camera className="h-4 w-4" /> {recording ? t('translate.stop') : t('dataset.record')}
            </Button>
            <Button onClick={capture} disabled={!recording || busy} className="flex-1 gap-2 rounded-2xl">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {t('dataset.capture')}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
          <Button onClick={() => fileRef.current.click()} disabled={busy} variant="outline" className="w-full gap-2 rounded-2xl h-12">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {t('dataset.uploadSample')}
          </Button>
          {toast && <div className="text-sm text-primary font-medium flex items-center gap-1.5"><Check className="h-4 w-4" /> {toast}</div>}
        </div>
      </div>

      <div>
        {samples.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">{t('dataset.noSamples')}</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {samples.map((s) => (
              <div key={s.id} className="relative group rounded-2xl overflow-hidden border border-border aspect-square bg-secondary">
                {s.media_type === 'video' ? (
                  <video src={s.file_url} className="h-full w-full object-cover" muted />
                ) : (
                  <Image src={s.file_url} className="h-full w-full" fittingType="fill" />
                )}
                <button onClick={() => remove(s)} className="absolute top-1.5 end-1.5 grid place-items-center h-7 w-7 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}