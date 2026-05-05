import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export function EmptyState({ icon, title, subtitle, style }) {
  const colors = useColors();
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.muted, borderRadius: 999 }]}>
        <Feather name={icon} size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 2 },
  iconWrapper: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", maxWidth: 260 },
});
