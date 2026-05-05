import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export function Badge({ label, variant = "primary", size = "md", style }) {
  const colors = useColors();

  const bgMap = {
    primary: colors.primary + "22",
    accent: colors.accent + "22",
    success: colors.success + "22",
    warning: colors.highlight + "22",
    destructive: colors.destructive + "22",
    muted: colors.muted,
  };
  const textMap = {
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.highlight,
    destructive: colors.destructive,
    muted: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant], paddingVertical: size === "sm" ? 2 : 4, paddingHorizontal: size === "sm" ? 8 : 10, borderRadius: 999 }, style]}>
      <Text style={[styles.text, { color: textMap[variant], fontSize: size === "sm" ? 11 : 12, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start" },
  text: {},
});
