import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface LoaderProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color = colors.accent,
  text,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    ...typography.caption,
    color: colors.secondaryText,
  },
});
