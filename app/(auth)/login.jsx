import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, checkEmailExists, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotNext = async () => {
    if (!forgotEmail.trim()) { setForgotError("Please enter your registered email."); return; }
    setForgotError("");
    setForgotLoading(true);
    try {
      await checkEmailExists(forgotEmail.trim());
      setForgotLoading(false);
      setForgotStep(2);
    } catch (e) {
      setForgotError(e.message || "No account found with that email address.");
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (!newPassword || !confirmPassword) { setForgotError("Please fill in both fields."); return; }
    if (newPassword !== confirmPassword) { setForgotError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setForgotError("Password must be at least 6 characters."); return; }
    setForgotError("");
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim(), newPassword);
      setForgotDone(true);
    } catch (e) {
      setForgotError(e.message || "Reset failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setForgotDone(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="book-open" size={28} color="#fff" />
          </View>
          <View>
            <Text style={[styles.appName, { fontFamily: "Inter_700Bold" }]}>Smart-A</Text>
            <Text style={[styles.tagline, { fontFamily: "Inter_400Regular" }]}>Smart Academy</Text>
          </View>
        </View>
        <Text style={[styles.welcomeText, { fontFamily: "Inter_600SemiBold" }]}>Welcome Back!</Text>
        <Text style={[styles.subText, { fontFamily: "Inter_400Regular" }]}>Sign in to continue your journey</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius * 2, borderColor: colors.border }]}>
            <Text style={[styles.signInTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sign In</Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40", borderRadius: colors.radius }]}>
                <Feather name="alert-circle" size={15} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text>
              </View>
            ) : null}

            <Input label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail" placeholder="you@email.com" />
            <Input label="Password" value={password} onChangeText={setPassword} secure leftIcon="lock" placeholder="Your password" containerStyle={{ marginTop: 14 }} />

            <View style={styles.rememberForgotRow}>
              <Pressable onPress={() => setRememberMe((r) => !r)} style={styles.rememberRow}>
                <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: rememberMe ? colors.primary : "transparent" }]}>
                  {rememberMe ? <Feather name="check" size={12} color="#fff" /> : null}
                </View>
                <Text style={[styles.rememberText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => setShowForgot(true)}>
                <Text style={[styles.forgotLink, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Forgot Password?</Text>
              </Pressable>
            </View>

            <Button onPress={handleLogin} title="Sign In" loading={loading} fullWidth style={{ marginTop: 18 }} />

            <View style={styles.registerRow}>
              <Text style={[styles.registerLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Don't have an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={[styles.registerLink, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Register</Text>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Pressable onPress={() => router.push("/admin/login")} style={[styles.adminBtn, { borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="shield" size={16} color={colors.mutedForeground} />
              <Text style={[styles.adminText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Admin Login</Text>
            </Pressable>
          </View>

          <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Smart-A — Empowering Nigerian University Students{"\n"}
            Support: admin01smart.academy@gmail.com
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showForgot} animationType="slide" transparent onRequestClose={closeForgot}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {forgotDone ? "Password Reset!" : "Reset Password"}
                </Text>
                <Text style={[styles.sheetSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {forgotDone ? "Your password has been updated successfully." : forgotStep === 1 ? "Enter your registered email address" : "Create your new password"}
                </Text>
              </View>
              <Pressable onPress={closeForgot} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {forgotDone ? (
              <View style={{ gap: 20, alignItems: "center", paddingVertical: 8 }}>
                <View style={[styles.successCircle, { backgroundColor: "#26A69A20" }]}>
                  <Feather name="check-circle" size={44} color="#26A69A" />
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" }}>
                  You can now sign in with your new password.
                </Text>
                <Button onPress={closeForgot} title="Back to Sign In" fullWidth />
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                {forgotError ? (
                  <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40", borderRadius: colors.radius }]}>
                    <Feather name="alert-circle" size={14} color={colors.destructive} />
                    <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{forgotError}</Text>
                  </View>
                ) : null}

                {forgotStep === 1 ? (
                  <>
                    <View style={{ gap: 6 }}>
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>Registered Email</Text>
                      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius }]}>
                        <Feather name="mail" size={16} color={colors.mutedForeground} />
                        <TextInput
                          value={forgotEmail}
                          onChangeText={setForgotEmail}
                          placeholder="you@email.com"
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={[styles.textInput, { color: colors.foreground }]}
                        />
                      </View>
                    </View>
                    <Button onPress={handleForgotNext} title="Verify Email" loading={forgotLoading} fullWidth />
                  </>
                ) : (
                  <>
                    <View style={{ gap: 6 }}>
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>New Password</Text>
                      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius }]}>
                        <Feather name="lock" size={16} color={colors.mutedForeground} />
                        <TextInput
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Min. 6 characters"
                          placeholderTextColor={colors.mutedForeground}
                          secureTextEntry
                          style={[styles.textInput, { color: colors.foreground }]}
                        />
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>Confirm New Password</Text>
                      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius }]}>
                        <Feather name="lock" size={16} color={colors.mutedForeground} />
                        <TextInput
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Repeat new password"
                          placeholderTextColor={colors.mutedForeground}
                          secureTextEntry
                          style={[styles.textInput, { color: colors.foreground }]}
                        />
                      </View>
                    </View>
                    <Button onPress={handleForgotReset} title="Reset Password" loading={forgotLoading} fullWidth />
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 40 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  logoBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  appName: { color: "#fff", fontSize: 22 },
  tagline: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  welcomeText: { color: "#fff", fontSize: 28 },
  subText: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 4 },
  form: { padding: 20 },
  card: { padding: 24, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginTop: -24 },
  signInTitle: { fontSize: 22, marginBottom: 20 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginBottom: 4, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  rememberForgotRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  rememberText: { fontSize: 13 },
  forgotLink: { fontSize: 13 },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  registerLabel: { fontSize: 14 },
  registerLink: { fontSize: 14 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  adminBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, padding: 12 },
  adminText: { fontSize: 14 },
  footer: { fontSize: 12, textAlign: "center", marginTop: 24, lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1 },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 22 },
  sheetTitle: { fontSize: 20, marginBottom: 3 },
  sheetSub: { fontSize: 13, lineHeight: 18 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  textInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  successCircle: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
});
