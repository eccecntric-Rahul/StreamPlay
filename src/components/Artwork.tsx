import React from 'react';
import {Image, StyleSheet} from 'react-native';

const WIDTH = 260;
const ASPECT = 787 / 675;

export default function Artwork() {
  return (
    <Image
      source={require('../assets/radio.png')}
      style={s.art}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

const s = StyleSheet.create({
  art: {
    width: WIDTH,
    height: WIDTH / ASPECT,
  },
});
