import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

let recognizerPromise;

function publicUrl(path) {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return new URL(`${normalizedBase}${path}`, window.location.origin).href;
}

async function getRecognizer() {
  if (!recognizerPromise) {
    recognizerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(publicUrl('mediapipe/wasm'));
      return GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: publicUrl('models/gesture_recognizer.task'),
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: 0.4,
        minHandPresenceConfidence: 0.4,
      });
    })().catch((error) => {
      recognizerPromise = undefined;
      throw error;
    });
  }
  return recognizerPromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image_load_failed'));
    image.src = src;
  });
}

export async function recognizeLocalGesture(imageSource) {
  const [recognizer, image] = await Promise.all([
    getRecognizer(),
    loadImage(imageSource),
  ]);
  const output = recognizer.recognize(image);
  const gesture = output.gestures?.[0]?.[0];

  if (!gesture) {
    return { connected: true, prediction: null, confidence: 0 };
  }

  if (gesture.categoryName === 'Thumb_Up' && gesture.score >= 0.45) {
    return {
      connected: true,
      prediction: 'باشە',
      confidence: gesture.score,
      gesture: gesture.categoryName,
    };
  }

  return {
    connected: true,
    prediction: null,
    confidence: gesture.score,
    gesture: gesture.categoryName,
  };
}
