import {NativeModules,NativeEventEmitter} from 'react-native';

export type AudioRoute='speaker'|'wired'|'bluetooth';

const native = NativeModules.AudioRouteModule;
if(!native){
    throw new Error('AudioRouteModule missing. Pls Rebuild');
}

const emitter = new NativeEventEmitter(native);

export const AudioRouteAPI = {
  start: () => native.startListening(),
  stop: () => native.stopListening(),
  getCurrent: (): Promise<AudioRoute> => native.getCurrentRoute(),
  subscribe: (cb: (r: AudioRoute) => void) =>
    emitter.addListener('onAudioRouteChanged', (e: { route: AudioRoute }) => cb(e.route)),
};

