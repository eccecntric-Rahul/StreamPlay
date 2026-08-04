import {useEffect, useState} from 'react';
import {AudioRouteAPI, AudioRoute} from './AudioRouteModule';

export function useAudioRoute(): AudioRoute {
  const [route, setRoute] = useState<AudioRoute>('speaker');

  useEffect(() => {
    const sub = AudioRouteAPI.subscribe(setRoute);
    AudioRouteAPI.start();
    return () => {
      sub.remove();
      AudioRouteAPI.stop();
    };
  }, []);

  return route;
}
