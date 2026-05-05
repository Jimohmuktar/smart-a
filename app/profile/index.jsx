import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const { courses, tasks, mentorSessions, quizScores, enrolledSkills, growthGoals, calculateGPA, adminMessages, markAdminMessageRead } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phone: user?.phone || "", school: user?.school || "", level: user?.level || "" });

  const gpa = calculateGPA();
  const completedTasks = tasks.filter((t) => t.completed).length;
  const unreadMessages = (adminMessages || []).filter((m) => !m.read);

  const handleSave = async () => {
    await updateProfile(form);
    setShowEdit(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); } },
    ]);
  };

  const STATS = [
    { label: "GPA", value: gpa.toFixed(2), icon: "award", color: colors.primary },
    { label: "Courses", value: courses.length, icon: "book", color: colors.accent },
    { label: "Tasks Done", value: completedTasks, icon: "check-circle", color: colors.success },
    { label: "Skills", value: enrolledSkills.length, icon: "star", color: colors.highlight },
    { label: "Sessions", value: mentorSessions.length, icon: "message-circle", color: "#7B1FA2" },
    { label: "Quiz", value: quizScores.length, icon: "help-circle", color: colors.destructive },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <View style={styles.profileInfo}>
          <Avatar name={user?.fullName || "S"} size={72} color="rgba(255,255,255,0.3)" />
          <Text style={[styles.name, { fontFamily: "Inter_700Bold" }]}>{user?.fullName}</Text>
          <Text style={[styles.regNo, { fontFamily: "Inter_400Regular" }]}>{user?.regNo}</Text>
          <View style={styles.badgesRow}>
            <Badge label={user?.level || ""} variant="muted" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
            <Badge label={user?.school || ""} variant="muted" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}>

        {/* Admin Messages Section */}
        {(adminMessages || []).length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Messages from Admin</Text>
              {unreadMessages.length > 0 && <Badge label={`${unreadMessages.length} new`} variant="destructive" size="sm" />}
            </View>
            <View style={{ gap: 8 }}>
              {adminMessages.map((msg) => (
                <Pressable key={msg.id} onPress={() => !msg.read && markAdminMessageRead(msg.id)}>
                  <Card style={[{ borderLeftWidth: 3, borderLeftColor: msg.read ? colors.border : colors.primary }]}>
                    <View style={styles.msgItemHeader}>
                      <View style={[styles.msgIconBox, { backgroundColor: colors.primary + "15" }]}>
                        <Feather name="bell" size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.msgTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{msg.title}</Text>
                        <Text style={[styles.msgTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{new Date(msg.createdAt).toLocaleDateString()}</Text>
                      </View>
                      {!msg.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.msgBody, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{msg.body}</Text>
                    {!msg.read && (
                      <Text style={[styles.tapToRead, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Tap to mark as read</Text>
                    )}
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statItem, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}><Feather name={s.icon} size={18} color={s.color} /></View>
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Card>
          <View style={styles.infoHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Account Details</Text>
            <Pressable onPress={() => setShowEdit(true)} style={[styles.editBtn, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="edit-2" size={16} color={colors.primary} />
              <Text style={[styles.editText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Edit</Text>
            </Pressable>
          </View>
          {[
            { label: "Email", value: user?.email, icon: "mail" },
            { label: "Phone", value: user?.phone, icon: "phone" },
            { label: "Level", value: user?.level, icon: "layers" },
            { label: "School", value: user?.school, icon: "home" },
            { label: "Reg. No.", value: user?.regNo, icon: "hash" },
          ].map((item) => (
            <View key={item.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Feather name={item.icon} size={16} color={colors.mutedForeground} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{item.value || "—"}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>Support & Info</Text>
          {[
            { label: "Email Support", sub: "admin01smart.academy@gmail.com", icon: "mail" },
            { label: "App Version", sub: "Smart-A v1.0.0", icon: "info" },
            { label: "Privacy Policy", sub: "How we protect your data", icon: "shield" },
          ].map((item) => (
            <View key={item.label} style={[styles.supportRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.supportIcon, { backgroundColor: colors.muted }]}>
                <Feather name={item.icon} size={16} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
                <Text style={[styles.supportSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
          ))}
        </Card>

        <Button onPress={handleLogout} title="Sign Out" variant="destructive" fullWidth />
      </ScrollView>

      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Edit Profile</Text>
              <Pressable onPress={() => setShowEdit(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={{ gap: 14 }}>
              {[
                { label: "Full Name", field: "fullName", placeholder: "Your full name" },
                { label: "Phone", field: "phone", placeholder: "+234 XXX XXX XXXX" },
                { label: "School", field: "school", placeholder: "University name" },
              ].map((f) => (
                <View key={f.field} style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
                  <TextInput value={form[f.field]} onChangeText={(v) => setForm((ff) => ({ ...ff, [f.field]: v }))} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} />
                </View>
              ))}
              <Button onPress={handleSave} title="Save Changes" fullWidth />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  backBtn: { marginBottom: 16 },
  profileInfo: { alignItems: "center", gap: 8 },
  name: { color: "#fff", fontSize: 22 },
  regNo: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  badgesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16 },
  msgItemHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  msgIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  msgTitle: { fontSize: 14 },
  msgTime: { fontSize: 11, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  msgBody: { fontSize: 14, lineHeight: 20 },
  tapToRead: { fontSize: 11, marginTop: 6, fontStyle: "italic" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { width: "30%", alignItems: "center", padding: 12, borderWidth: 1, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 16 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  editText: { fontSize: 13 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, marginTop: 2 },
  supportRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  supportIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  supportLabel: { fontSize: 14 },
  supportSub: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  fieldLabel: { fontSize: 13 },
  textField: { height: 50, paddingHorizontal: 14, fontSize: 15 },
});
