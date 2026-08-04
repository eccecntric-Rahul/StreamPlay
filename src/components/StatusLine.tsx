import React from 'react';
import {View, Text, ActivityIndicator, Pressable, StyleSheet} from 'react-native';
import {colors, space} from '../theme';

type Props = {
  buffering: boolean;
  error: boolean;
  onRetry: () => void;
};

export default function StatusLine({buffering, error, onRetry}: Props) {
  return (
    <View style={s.row}>
      {error ? (
        <>
          <Text style={s.error}>Stream unavailable</Text>
          <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
            <Text style={s.retry}>Try again</Text>
          </Pressable>
        </>
      ) : buffering ? (
        <>
          <ActivityIndicator size="small" color={colors.faint} />
          <Text style={s.meta}>Buffering</Text>
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  meta: {fontSize: 12, color: colors.faint},
  error: {fontSize: 12, color: colors.danger},
  retry: {fontSize: 12, color: colors.text, textDecorationLine: 'underline'},
});
