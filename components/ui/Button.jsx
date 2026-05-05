import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export function Button({ onPress, title, variant = "primary", size = "md", loading, disabled, style, fullWidth }) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    outline: "transparent",
    ghost: "transparent",
    destructive: colors.destructive,
    accent: colors.accent,
  }[variant];

  const textColor = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    outline: colors.primary,
    ghost: colors.primary,
    destructive: colors.destructiveForeground,
    accent: colors.accentForeground,
  }[variant];

  const borderColor = variant === "outline" ? colors.primary : "transparent";
  const paddingV = { sm: 8, md: 12, lg: 16 }[size];
  const fontSize = { sm: 13, md: 15, lg: 16 }[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          paddingVertical: paddingV,
          borderRadius: colors.radius,
          opacity: pressed || disabled ? 0.7 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize, fontFamily: "Inter_600SemiBold" }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20, flexDirection: "row", gap: 8 },
  text: { textAlign: "center" },
});
