import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import {useAudioRoute} from './src/modules/audioRoute/useAudioRoute';
import {ROUTE_LABEL, Status, STREAM_URL} from './src/constants/constants';

export default function App() {
  const route = useAudioRoute();

  const [status, setStatus] = useState<Status>('idle');
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const toggle = () => {
    setError(null);
    setPaused(p => !p);
  };

  const reload = () => {
    setError(null);
    setBuffering(true);
    setReloadKey(k => k + 1); // remount forces a fresh connection
    setPaused(false);
  };

  const isPlaying = status === 'playing' || status === 'buffering';
  return (
    <SafeAreaView>
      <Video
        key={reloadKey}
        source={{uri: STREAM_URL}}
        paused={paused}
        playInBackground
        style={{width: 0, height: 0}}
        audioOnly
        onBuffer={({isBuffering}) =>
          setStatus(s =>
            s === 'error' ? s : isBuffering ? 'buffering' : 'playing',
          )
        }
        onLoad={() => setStatus('playing')}
        onError={() => {
          setPaused(true); // keep intent and reality in sync
          setStatus('error');
        }}
      />

      <View>
        <Text>Playing on: {ROUTE_LABEL[route]}</Text>
        <Text>All India Radio — Live</Text>
        <Text>Prasar Bharati</Text>

        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={toggle} />

        {status === 'buffering' && (
          <View>
            <ActivityIndicator />
            <Text>Buffering…</Text>
          </View>
        )}

        {status === 'error' && (
          <View>
            <Text>Stream unavailable.</Text>
            <Button title="Try again" onPress={reload} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
