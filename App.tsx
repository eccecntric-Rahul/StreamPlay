import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StatusBar, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import {useAudioRoute} from './src/modules/audioRoute/useAudioRoute';
import {
  ROUTE_LABEL,
  STALL_TIMEOUT_MS,
  STATION_NAME,
  STATION_SUB,
  STREAM_URL,
} from './src/constants/constants';
import {colors, space} from './src/theme';
import Artwork from './src/components/Artwork';
import PlayButton from './src/components/PlayButton';
import StatusLine from './src/components/StatusLine';

export default function App() {
  const route = useAudioRoute();

  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const fail = useCallback(() => {
    setPaused(true);
    setBuffering(false);
    setReconnecting(false);
    setError(true);
  }, []);

  const reload = useCallback(() => {
    setError(false);
    setBuffering(false);
    setReconnecting(true);
    setReloadKey(k => k + 1);
    setPaused(false);
  }, []);

  const toggle = () => {
    if (error) {
      reload();
      return;
    }
    setPaused(p => {
      if (!p) {
        setReconnecting(false);
      }
      return !p;
    });
  };

  const stalled = !paused && !error && (buffering || reconnecting);

  useEffect(() => {
    if (!stalled) {
      return;
    }
    const timer = setTimeout(fail, STALL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [stalled, fail]);

  const connected = () => {
    setBuffering(false);
    setReconnecting(false);
  };

  const playing = !paused && !error;

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <Video
        key={reloadKey}
        source={{uri: STREAM_URL}}
        paused={paused}
        playInBackground
        style={s.player}
        onBuffer={({isBuffering}) => {
          setBuffering(isBuffering);
          if (!isBuffering) {
            setReconnecting(false);
          }
        }}
        onLoad={connected}
        onReadyForDisplay={connected}
        onError={fail}
      />

      <Text style={s.wordmark}>STREAMPLAY</Text>

      <View style={s.main}>
        <Artwork />

        <View style={s.meta}>
          <View style={s.liveRow}>
            <View style={[s.dot, playing && s.dotLive]} />
            <Text style={s.live}>Live</Text>
          </View>
          <Text style={s.station}>{STATION_NAME}</Text>
          <Text style={s.sub}>{STATION_SUB}</Text>
        </View>

        <PlayButton paused={paused} onPress={toggle} />
      </View>

      <View style={s.footer}>
        <View style={s.divider} />
        <View style={s.footerRow}>
          <Text style={s.route} numberOfLines={1}>
            {ROUTE_LABEL[route]}
          </Text>
          <StatusLine
            buffering={buffering && !paused}
            reconnecting={reconnecting}
            error={error}
            onRetry={reload}
          />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingTop: (StatusBar.currentHeight ?? 0) + space.xl,
  },
  player: {width: 0, height: 0},

  wordmark: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.6,
    color: colors.faint,
  },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: space.lg,
  },
  meta: {
    alignItems: 'center',
    marginTop: space.xxl,
    marginBottom: space.xxl,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.faint,
  },
  dotLive: {backgroundColor: colors.accent},
  live: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  station: {
    fontSize: 27,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: colors.text,
  },
  sub: {
    fontSize: 15,
    color: colors.muted,
    marginTop: space.xs,
  },

  footer: {paddingBottom: space.xxl},
  divider: {height: 1, backgroundColor: colors.border},
  footerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  route: {fontSize: 12, color: colors.faint, flexShrink: 1},
});
