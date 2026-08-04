import React from 'react';
import {Pressable, View, StyleSheet} from 'react-native';
import {colors} from '../theme';

type Props = {
  paused: boolean;
  onPress: () => void;
};

const SIZE = 68;

export default function PlayButton({paused, onPress}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={paused ? 'Play' : 'Pause'}
      style={({pressed}) => [s.button, pressed && s.pressed]}>
      {paused ? <View style={s.play} /> : <PauseGlyph />}
    </Pressable>
  );
}

function PauseGlyph() {
  return (
    <View style={s.pauseRow}>
      <View style={s.bar} />
      <View style={s.bar} />
    </View>
  );
}

const s = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.82},
  play: {
    width: 0,
    height: 0,
    borderLeftWidth: 19,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.onAccent,
    marginLeft: 5,
  },
  pauseRow: {flexDirection: 'row', gap: 6},
  bar: {
    width: 5,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.onAccent,
  },
});
