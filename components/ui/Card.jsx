import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export function Card({ children, style, padded = true, elevated = false }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          elevation: elevated ? 4 : 2,
          padding: padded ? 16 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, overflow: "scroll" },
});
