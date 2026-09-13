import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Square, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import CameraView from '@/components/recognition/CameraView';
import RecognitionResult from '@/components/recognition/RecognitionResult';

export default function Translate() {
  const { t } = useLang();
  const [active, setActive] = useState(false);
  const [modelConnected, setModelConnected] = useState(null);
  const [result, setResult] = useState(null);
  const [session, setSession] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(false);
  const cameraRef = useRef(null);
  const busyRef = useRef(false);
  const lastRef = useRef({ word: null, time: 0 });

  const recognize = useCallback(async () => {
    if (busyRef.current || !cameraRef.current) return;
    busyRef.current = true;
    try {
      const frame = cameraRef.current.captureFrame();
      if (!frame) return;
      const res = await base44.functions.invoke('analyzeSign', { image_data: frame, media_type: 'image' });
      const data = res.data;
      if (data && data.connected === false) {
        setModelConnected(false);
        return;
      }
      if (data && data.connected && data.prediction) {
        setModelConnected(true);
        setResult({ prediction: data.prediction, confidence: data.confidence });
        const now = Date.now();
        if (data.prediction !== lastRef.current.word || now - lastRef.current.time > 4000) {
          lastRef.current = { word: data.prediction, time: now };
          setSession((s) => [...s, { word: data.prediction, confidence: data.confidence }].slice(-12));
          base44.entities.RecognitionRecord.create({ word: data.prediction, confidence: data.confidence || 0, source: 'camera' }).catch(() => {});
        }
      }
    } catch (e) {
    } finally {
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!active || modelConnected === false) return;
    recognize();
    const id = setInterval(recognize, 3000);
    return () => clearInterval(id);
  }, [active, modelConnected, recognize]);

  const speak = async (text) => {
    setSpeaking(true);
    try {
      const res = await base44.functions.invoke('speakText', { text });
      const url = res.data?.url;
      if (url) await new Audio(url).play();
    } catch (e) {
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{t('translate.title')}</h1>

      {modelConnected === false && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">{t('translate.modelNotConnected')}</div>
            <div className="text-sm opacity-90 mt-0.5">{t('translate.modelHint')}</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {active ? (
            <CameraView ref={cameraRef} onError={() => setError(true)} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border aspect-[4/3] grid place-items-center text-center p-6">
              <div>
                <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">{t('translate.idle')}</p>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{t('translate.cameraError')}</p>}
          <div className="flex gap-3">
            {!active ? (
              <Button onClick={() => { setError(false); setActive(true); }} className="flex-1 gap-2 rounded-2xl h-12 text-base">
                <Camera className="h-5 w-5" /> {t('translate.start')}
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => setActive(false)} className="flex-1 gap-2 rounded-2xl h-12 text-base">
                <Square className="h-5 w-5" /> {t('translate.stop')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <RecognitionResult result={result} onSpeak={speak} speaking={speaking} disabled={modelConnected === false} />
          {session.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t('translate.session')}</div>
              <div className="flex flex-wrap gap-2">
                {session.map((s, i) => (
                  <span key={i} className="rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-sm font-medium">{s.word}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}