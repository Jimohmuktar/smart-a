import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "Postgraduate"];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", regNo: "", email: "", phone: "", password: "", confirmPassword: "", level: "", school: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleNext = () => {
    if (!form.fullName || !form.regNo || !form.email) { setError("Please fill in all required fields."); return; }
    if (!form.email.includes("@")) { setError("Enter a valid email address."); return; }
    setError(""); setStep(2);
  };

  const handleRegister = async () => {
    if (!form.phone || !form.level || !form.school || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await register(form);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Create Account</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Step {step} of 2 — {step === 1 ? "Personal Info" : "Academic Details"}</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progBar, { backgroundColor: "#fff", flex: 1 }]} />
          <View style={[styles.progBar, { backgroundColor: step >= 2 ? "#fff" : "rgba(255,255,255,0.3)", flex: 1 }]} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius * 2, borderColor: colors.border }]}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40", borderRadius: colors.radius }]}>
                <Feather name="alert-circle" size={15} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text>
              </View>
            ) : null}

            {step === 1 ? (
              <View style={{ gap: 14 }}>
                <Input label="Full Name *" value={form.fullName} onChangeText={(v) => set("fullName", v)} leftIcon="user" placeholder="e.g. Adaeze Okonkwo" autoCapitalize="words" />
                <Input label="Registration Number *" value={form.regNo} onChangeText={(v) => set("regNo", v)} leftIcon="hash" placeholder="e.g. 2021/1/12345AB" autoCapitalize="characters" />
                <Input label="Email Address *" value={form.email} onChangeText={(v) => set("email", v)} leftIcon="mail" placeholder="student@university.edu.ng" keyboardType="email-address" autoCapitalize="none" />
                <Button onPress={handleNext} title="Continue" fullWidth />
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Input label="Phone Number *" value={form.phone} onChangeText={(v) => set("phone", v)} leftIcon="phone" placeholder="+234 XXX XXX XXXX" keyboardType="phone-pad" />
                <Input label="University / Polytechnic *" value={form.school} onChangeText={(v) => set("school", v)} leftIcon="home" placeholder="e.g. University of Lagos" autoCapitalize="words" />
                <View style={{ gap: 6 }}>
                  <Text style={[styles.levelLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Current Level *</Text>
                  <View style={styles.levelGrid}>
                    {LEVELS.map((lv) => (
                      <Pressable key={lv} onPress={() => set("level", lv)} style={[styles.levelBtn, { borderColor: form.level === lv ? colors.primary : colors.border, backgroundColor: form.level === lv ? colors.primary + "18" : colors.card, borderRadius: colors.radius }]}>
                        <Text style={[styles.levelText, { color: form.level === lv ? colors.primary : colors.foreground, fontFamily: "Inter_500Medium" }]}>{lv}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Input label="Password *" value={form.password} onChangeText={(v) => set("password", v)} secure leftIcon="lock" placeholder="Min. 6 characters" />
                <Input label="Confirm Password *" value={form.confirmPassword} onChangeText={(v) => set("confirmPassword", v)} secure leftIcon="lock" placeholder="Repeat your password" />
                <Button onPress={handleRegister} title="Create Account" loading={loading} fullWidth style={{ marginTop: 8 }} />
              </View>
            )}

            <View style={styles.loginRow}>
              <Text style={[styles.loginLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text style={[styles.loginLink, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 32 },
  backBtn: { marginBottom: 12, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 26 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  progressRow: { flexDirection: "row", gap: 6, marginTop: 16, height: 4 },
  progBar: { borderRadius: 2 },
  form: { padding: 20 },
  card: { padding: 24, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginTop: -24 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  levelLabel: { fontSize: 13 },
  levelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  levelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  levelText: { fontSize: 13 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  loginLabel: { fontSize: 14 },
  loginLink: { fontSize: 14 },
});
