import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { storage } from "@/utils/storage";

const ADMIN_EMAIL = "admin01smart.academy@gmail.com";
const ADMIN_PASSWORD = "SmartAdmin2024!";

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter admin credentials."); return; }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    if (email.toLowerCase().trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      await storage.set("smart_a_admin_session", { email, loginAt: new Date().toISOString() });
      router.replace("/admin/dashboard");
    } else {
      setError("Invalid admin credentials. Unauthorized access will be logged.");
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0F1E" }}>
      <LinearGradient colors={["#1A237E", "#0D47A1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={[styles.shieldBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="shield" size={40} color="#fff" />
        </View>
        <Text style={[styles.title, { fontFamily: "Inter_700Bold" }]}>Admin Portal</Text>
        <Text style={[styles.subtitle, { fontFamily: "Inter_400Regular" }]}>Smart-A Academy Management System</Text>
        <View style={[styles.restrictedBadge, { backgroundColor: "rgba(198,40,40,0.3)" }]}>
          <Feather name="lock" size={12} color="#FF8A80" />
          <Text style={[styles.restrictedText, { fontFamily: "Inter_600SemiBold" }]}>Restricted Access — Authorized Personnel Only</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: "#131B2E", borderRadius: colors.radius * 2, borderColor: "#1E3054" }]}>
            <Text style={[styles.cardTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Administrator Sign In</Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "#C6282815", borderColor: "#C6282840", borderRadius: colors.radius }]}>
                <Feather name="alert-triangle" size={15} color="#EF5350" />
                <Text style={[styles.errorText, { color: "#EF5350", fontFamily: "Inter_400Regular" }]}>{error}</Text>
              </View>
            ) : null}

            <Input label="Admin Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail" placeholder="admin01smart.academy@gmail.com" />
            <Input label="Admin Password" value={password} onChangeText={setPassword} secure leftIcon="lock" placeholder="Admin password" containerStyle={{ marginTop: 14 }} />

            <Button onPress={handleLogin} title="Access Admin Panel" loading={loading} fullWidth style={{ marginTop: 22, backgroundColor: "#1565C0" }} />

            <View style={[styles.secureNote, { backgroundColor: "#1A2540", borderRadius: colors.radius }]}>
              <Feather name="lock" size={14} color="#5B8DEF" />
              <Text style={[styles.secureText, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>All admin actions are logged and monitored for security.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 16, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  shieldBox: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { color: "#fff", fontSize: 28 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  restrictedBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 14 },
  restrictedText: { color: "#FF8A80", fontSize: 12 },
  form: { padding: 20 },
  card: { padding: 24, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8, marginTop: -24 },
  cardTitle: { fontSize: 20, marginBottom: 20 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  secureNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, marginTop: 16 },
  secureText: { fontSize: 12, flex: 1, lineHeight: 17 },
});
