import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CameraView = forwardRef(function CameraView({ onError, overlay, className }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facing, setFacing] = useState('user');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => onError && onError());
    return () => {
      cancelled = true;
      setReady(false);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [facing, onError]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return null;
      const canvas = canvasRef.current;
      const w = 640;
      const h = Math.round((video.videoHeight / video.videoWidth) * w) || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.85);
    },
    isReady: () => ready
  }));

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-black aspect-[4/3] ${className || ''}`}>
      <video ref={videoRef} playsInline muted autoPlay onLoadedMetadata={() => setReady(true)} className="absolute inset-0 h-full w-full object-cover" style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }} />
      <canvas ref={canvasRef} className="hidden" />
      {overlay}
      <Button variant="secondary" size="icon" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))} className="absolute top-3 end-3 rounded-full shadow-lg">
        <RefreshCw className="h-4 w-4" />
      </Button>
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-7 w-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

export default CameraView;