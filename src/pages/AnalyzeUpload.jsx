import React, { useRef, useState } from 'react';
import { Upload, Loader2, ImagePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import RecognitionResult from '@/components/recognition/RecognitionResult';
import { Image } from '@/components/ui/image';
import { recognizeLocalGesture } from '@/lib/localGestureRecognizer';

export default function AnalyzeUpload() {
  const { t } = useLang();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const onFile = (f) => {
    setError(null);
    setResult(null);
    setFile(f);
    const isVideo = f.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');
    setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      let data;
      if (mediaType === 'image') {
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        data = await recognizeLocalGesture(dataUrl);
      } else {
        setError('video_not_supported_in_local_test');
        return;
      }
      if (data && data.connected === false) {
        setResult({ prediction: null, notConnected: true });
      } else if (data && data.connected && data.prediction) {
        setResult({ prediction: data.prediction, confidence: data.confidence });
        base44.entities.RecognitionRecord.create({ word: data.prediction, confidence: data.confidence || 0, source: 'upload' }).catch(() => {});
      } else {
        setResult(null);
        setError(data?.error || 'no_gesture');
      }
    } catch (e) {
      setError(e.message || 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ku';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{t('upload.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('upload.desc')}</p>
      </div>

      <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center">
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
        {preview ? (
          <div className="space-y-4">
            {mediaType === 'image' ? (
              <Image src={preview} className="mx-auto max-h-72 rounded-2xl" fittingType="fit" />
            ) : (
              <video src={preview} controls className="mx-auto max-h-72 rounded-2xl" />
            )}
            <Button variant="outline" onClick={() => inputRef.current.click()} className="gap-2 rounded-xl">
              <ImagePlus className="h-4 w-4" /> {t('upload.choose')}
            </Button>
          </div>
        ) : (
          <button onClick={() => inputRef.current.click()} className="w-full py-10">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">{t('upload.dragDrop')}</p>
          </button>
        )}
      </div>

      <Button onClick={analyze} disabled={!file || analyzing} className="w-full gap-2 rounded-2xl h-12 text-base">
        {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        {analyzing ? t('upload.analyzing') : t('upload.analyze')}
      </Button>

      {error && <p className="text-sm text-destructive text-center">{t('common.error')}</p>}

      {result && (
        result.notConnected ? (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300 p-4 font-bold text-center">{t('translate.modelNotConnected')}</div>
        ) : (
          <RecognitionResult result={result} onSpeak={speak} speaking={speaking} />
        )
      )}
    </div>
  );
}
