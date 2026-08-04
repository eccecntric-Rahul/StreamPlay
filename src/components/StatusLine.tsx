import React from 'react';
import {View, Text, ActivityIndicator, Pressable, StyleSheet} from 'react-native';
import {colors, space} from '../theme';

type Props = {
  buffering: boolean;
  reconnecting: boolean;
  error: boolean;
  onRetry: () => void;
};

export default function StatusLine({
  buffering,
  reconnecting,
  error,
  onRetry,
}: Props) {
  if (error) {
    return (
      <View style={s.row}>
        <Text style={s.error}>Connection lost</Text>
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={10}>
          <Text style={s.retry}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (reconnecting || buffering) {
    return (
      <View style={s.row}>
        <ActivityIndicator size="small" color={colors.faint} />
        <Text style={s.meta}>{reconnecting ? 'Reconnecting' : 'Buffering'}</Text>
      </View>
    );
  }

  return <View style={s.row} />;
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
