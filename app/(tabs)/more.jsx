import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

const FEATURES = [
  { label: "Brain Teaser Quiz", icon: "help-circle", route: "/quiz", color: "#7B1FA2", sub: "Test your knowledge", bg: "#7B1FA2" },
  { label: "Skills Marketplace", icon: "award", route: "/skills", color: "#E65100", sub: "Learn in-demand skills", bg: "#E65100" },
  { label: "AI Study Assistant", icon: "cpu", route: "/ai-chat", color: "#00897B", sub: "Powered by Gemini AI", bg: "#00897B" },
  { label: "Career Path", icon: "trending-up", route: "/career", color: "#1565C0", sub: "Discover your future", bg: "#1565C0" },
  { label: "Bootcamp Classroom", icon: "video", route: "/bootcamp", color: "#C62828", sub: "Virtual learning rooms", bg: "#C62828" },
  { label: "Student Network", icon: "users", route: "/network", color: "#2E7D32", sub: "Connect with peers", bg: "#2E7D32" },
  { label: "Personal Growth", icon: "star", route: "/growth", color: "#FF8F00", sub: "Goals & motivation", bg: "#FF8F00" },
  { label: "My Profile", icon: "user", route: "/profile", color: "#546E7A", sub: "Account & settings", bg: "#546E7A" },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { adminMessages } = useApp();

  const unreadMessages = adminMessages.filter((m) => !m.read).length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive", onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        }
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : 0 }]}>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Explore Smart-A</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>All features for {user?.fullName?.split(" ")[0] || "you"}</Text>
      </LinearGradient>

      <View style={{ padding: 16 }}>
        {/* Admin Messages Banner */}
        {adminMessages.length > 0 && (
          <Pressable
            onPress={() => router.push("/profile")}
            style={[styles.adminMsgBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "40", borderRadius: colors.radius * 1.5, borderWidth: 1, marginBottom: 16 }]}
          >
            <View style={[styles.adminMsgIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="bell" size={20} color={colors.primary} />
              {unreadMessages > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                  <Text style={[styles.badgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{unreadMessages}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }]}>Messages from Admin</Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>{unreadMessages > 0 ? `${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}` : "All messages read"}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}

        <View style={styles.grid}>
          {FEATURES.map((feat) => (
            <Pressable key={feat.label} onPress={() => router.push(feat.route)} style={({ pressed }) => [styles.featureCard, { backgroundColor: colors.card, borderRadius: colors.radius * 1.5, borderColor: colors.border, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <LinearGradient colors={[feat.bg + "20", feat.bg + "08"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureGrad}>
                <View style={[styles.featureIcon, { backgroundColor: feat.bg + "20" }]}>
                  <Feather name={feat.icon} size={26} color={feat.color} />
                </View>
                <Text style={[styles.featureLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{feat.label}</Text>
                <Text style={[styles.featureSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{feat.sub}</Text>
                <View style={[styles.arrowBox, { backgroundColor: feat.bg + "15" }]}>
                  <Feather name="arrow-right" size={14} color={feat.color} />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <View style={[styles.supportCard, { backgroundColor: colors.muted, borderRadius: colors.radius * 1.5, borderColor: colors.border, borderWidth: 1, marginBottom: 12 }]}>
          <Feather name="mail" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Need Help?</Text>
            <Text style={[styles.supportEmail, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>admin01smart.academy@gmail.com</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "40", borderRadius: colors.radius * 1.5, borderWidth: 1, opacity: pressed ? 0.8 : 1 }]}>
          <Feather name="log-out" size={20} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Smart-A v1.0.0 — Smart Academy Ecosystem{"\n"}Empowering Nigerian University Students</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 24 },
  headerTitle: { color: "#fff", fontSize: 24 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 4 },
  adminMsgBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  adminMsgIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  featureCard: { width: "47%", borderWidth: 1, overflow: "hidden" },
  featureGrad: { padding: 16, gap: 10, minHeight: 130 },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 13, lineHeight: 18 },
  featureSub: { fontSize: 11, lineHeight: 16 },
  arrowBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  supportCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  supportTitle: { fontSize: 15 },
  supportEmail: { fontSize: 13, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, marginBottom: 16 },
  logoutText: { fontSize: 16 },
  version: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
