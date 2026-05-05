import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export function Avatar({ name, size = 40, style, color }) {
  const colors = useColors();
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const avatarColors = [colors.primary, colors.accent, colors.highlight, "#7B1FA2", "#C62828"];
  const colorIndex = name.charCodeAt(0) % avatarColors.length;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color || avatarColors[colorIndex] }, style]}>
      <Text style={[styles.text, { fontSize: size * 0.38, color: "#fff", fontFamily: "Inter_600SemiBold" }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  text: {},
});
