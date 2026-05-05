import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export function Input({ label, error, containerStyle, leftIcon, rightIcon, onRightIconPress, secure, ...props }) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secure;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text> : null}
      <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: error ? colors.destructive : colors.border, borderRadius: colors.radius }]}>
        {leftIcon ? <Feather name={leftIcon} size={18} color={colors.mutedForeground} style={styles.leftIcon} /> : null}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular", paddingLeft: leftIcon ? 0 : 14, paddingRight: (isPassword || rightIcon) ? 0 : 14 }]}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather name={rightIcon} size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, height: 50 },
  leftIcon: { paddingLeft: 14, paddingRight: 8 },
  rightIcon: { paddingRight: 14, paddingLeft: 8 },
  input: { flex: 1, fontSize: 15, height: "100%" },
  error: { fontSize: 12 },
});
