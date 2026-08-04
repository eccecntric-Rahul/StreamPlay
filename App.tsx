/**
 * @format
 */

import React, {useEffect, useRef} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';

import {useAudioRoute} from './src/modules/audioRoute/useAudioRoute';

function App(): React.JSX.Element {
  const route = useAudioRoute();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    // Skip the first render: an alert fired before the activity is resumed
    // gets dropped by Android's dialog manager.
    if (prev.current !== null && prev.current !== route) {
      Alert.alert('Audio route', route);
    }
    prev.current = route;
  }, [route]);

  return (
    <View style={styles.screen}>
      <Text style={styles.route}>{route}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  route: {fontSize: 32, fontWeight: '700'},
});

export default App;
