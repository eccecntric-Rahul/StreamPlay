import React, {useState} from 'react';
import {SafeAreaView, View, Text, Button, ActivityIndicator} from 'react-native';
import Video from 'react-native-video';
import {useAudioRoute} from './src/modules/audioRoute/useAudioRoute';
import {ROUTE_LABEL, STREAM_URL} from './src/constants/constants';

export default function App() {
  const route = useAudioRoute();

  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const toggle = () => {
    setError(null);
    setPaused(p => !p);
  };

  const retry = () => {
    setError(null);
    setBuffering(true);
    setReloadKey(k => k + 1); // remount forces a fresh connection
    setPaused(false);
  };

  return (
    <SafeAreaView>
      <Video
        key={reloadKey}
        source={{uri: STREAM_URL}}
        paused={paused}
        playInBackground
        style={{width: 0, height: 0}}
        onBuffer={({isBuffering}) => setBuffering(isBuffering)}
        onLoad={() => {
          setBuffering(false);
          setError(null);
        }}
        onError={() => setError('Stream unavailable. Check your connection.')}
      />

      <View>
        <Text>Playing on: {ROUTE_LABEL[route]}</Text>
        <Text>All India Radio — Live</Text>
        <Text>Prasar Bharati</Text>

        <Button title={paused ? 'Play' : 'Pause'} onPress={toggle} />

        {buffering && (
          <View>
            <ActivityIndicator />
            <Text>Buffering…</Text>
          </View>
        )}

        {error && (
          <View>
            <Text>{error}</Text>
            <Button title="Retry" onPress={retry} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
