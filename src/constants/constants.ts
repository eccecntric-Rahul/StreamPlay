import { AudioRoute } from "../modules/audioRoute/AudioRouteModule";

export const ROUTE_LABEL: Record<AudioRoute, string> = {
  speaker: 'Speaker',
  wired: 'Wired Headphones',
  bluetooth: 'Bluetooth',
};


export const STREAM_URL =
  'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8';
  
export type Status = 'idle' | 'buffering' | 'playing' | 'paused' | 'error';
  