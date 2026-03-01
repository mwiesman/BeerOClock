import { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, shadows, emboss, gradients } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'danger' | 'success';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const variantConfig: Record<ButtonVariant, { gradient: string[]; pressedGradient: string[]; textColor: string }> = {
  primary: {
    gradient: gradients.button,
    pressedGradient: gradients.buttonPressed,
    textColor: colors.white,
  },
  secondary: {
    gradient: gradients.buttonSecondary,
    pressedGradient: ['#C8C5C2', '#D6D3D1'],
    textColor: colors.grayDark,
  },
  dark: {
    gradient: gradients.buttonDark,
    pressedGradient: [colors.brown, colors.brownMedium],
    textColor: colors.amberLight,
  },
  danger: {
    gradient: gradients.buttonDanger,
    pressedGradient: [colors.redDark, colors.red],
    textColor: colors.white,
  },
  success: {
    gradient: gradients.buttonSuccess,
    pressedGradient: [colors.greenDark, colors.green],
    textColor: colors.white,
  },
};

export default function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const config = variantConfig[variant];
  const currentGradient = pressed ? config.pressedGradient : config.gradient;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={[styles.wrapper, shadows.md, style]}
    >
      <LinearGradient
        colors={currentGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradient, emboss.raised, pressed && styles.pressed]}
      >
        <Text style={[styles.text, { color: config.textColor }, textStyle]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    paddingTop: 18,
    paddingBottom: 14,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
