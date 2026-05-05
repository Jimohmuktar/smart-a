import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

const ANON_NAMES = ["Eagle", "Lion", "Phoenix", "Falcon", "Panther", "Hawk", "Tiger", "Jaguar", "Wolf", "Bear"];

function generateAnonName(id) {
  const idx = id.charCodeAt(0) % ANON_NAMES.length;
  return `Anonymous ${ANON_NAMES[idx]}`;
}

export default function MentorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { mentorSessions, createMentorSession, addMentorMessage, mentorApplications, applyAsMentor } = useApp();
  const [activeSession, setActiveSession] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [role, setRole] = useState("mentee");
  const [isAnon, setIsAnon] = useState(true);
  const [input, setInput] = useState("");
  const [applyForm, setApplyForm] = useState({ expertise: "", bio: "", experience: "" });

  const myAnonName = generateAnonName(user?.id || "A");
  const myApplication = mentorApplications.find((a) => a.userId === user?.id);

  const handleCreate = async () => {
    if (!topic.trim()) return;
    const session = await createMentorSession({ topic, role, isAnon, myAnonName });
    setTopic("");
    setShowNewModal(false);
    setActiveSession(session);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return;
    const msg = { role: "user", content: input.trim(), sender: isAnon ? myAnonName : user?.fullName?.split(" ")[0] || "You" };
    await addMentorMessage(activeSession.id, msg);
    setInput("");
    const updated = { ...activeSession, messages: [...activeSession.messages, { ...msg, id: Date.now().toString(), timestamp: new Date().toISOString() }] };
    setActiveSession(updated);
  };

  const handleApply = async () => {
    if (!applyForm.expertise.trim() || !applyForm.bio.trim()) {
      Alert.alert("Missing Fields", "Please fill in expertise and bio.");
      return;
    }
    await applyAsMentor({ userId: user?.id, userName: user?.fullName, school: user?.school, level: user?.level, ...applyForm });
    setShowApplyModal(false);
    Alert.alert("Application Submitted!", "Your mentor application has been sent for review. You will be notified once approved.");
  };

  if (activeSession) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 67 : 0 }]}>
          <Pressable onPress={() => setActiveSession(null)} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chatTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{activeSession.topic}</Text>
            <Text style={[styles.chatSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{isAnon ? myAnonName : user?.fullName} • Anonymous Mode {isAnon ? "ON" : "OFF"}</Text>
          </View>
          <View style={[styles.anonBadge, { backgroundColor: isAnon ? colors.accent + "20" : colors.muted }]}>
            <Feather name="eye-off" size={14} color={isAnon ? colors.accent : colors.mutedForeground} />
          </View>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
            <View style={[styles.infoBox, { backgroundColor: colors.accent + "15", borderRadius: colors.radius, borderColor: colors.accent + "30", borderWidth: 1 }]}>
              <Feather name="shield" size={14} color={colors.accent} />
              <Text style={[styles.infoText, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>Your identity is {isAnon ? "fully protected" : "visible"}. You appear as "{isAnon ? myAnonName : user?.fullName}" in this session.</Text>
            </View>
            {activeSession.messages.length === 0 ? (
              <EmptyState icon="message-circle" title="Start the conversation" subtitle="Ask your question or share a challenge. Your identity is protected." />
            ) : (
              activeSession.messages.map((msg) => (
                <View key={msg.id} style={[styles.bubbleRow, { justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }]}>
                  {msg.role !== "user" && <Avatar name={msg.sender || "M"} size={32} />}
                  <View style={{ maxWidth: "72%" }}>
                    {msg.role !== "user" && <Text style={[styles.senderName, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{msg.sender}</Text>}
                    <View style={[styles.bubble, { backgroundColor: msg.role === "user" ? colors.primary : colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.bubbleText, { color: msg.role === "user" ? "#fff" : colors.foreground, fontFamily: "Inter_400Regular" }]}>{msg.content}</Text>
                      <Text style={[styles.bubbleTime, { color: msg.role === "user" ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                    </View>
                  </View>
                  {msg.role === "user" && <Avatar name={msg.sender || "Y"} size={32} />}
                </View>
              ))
            )}
          </ScrollView>
          <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
            <TextInput value={input} onChangeText={setInput} placeholder={`Message as ${isAnon ? myAnonName : user?.fullName?.split(" ")[0]}...`} placeholderTextColor={colors.mutedForeground} style={[styles.chatInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: 22, fontFamily: "Inter_400Regular" }]} multiline />
            <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
              <Feather name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100, gap: 16 }}>
        {/* Header */}
        <View style={[styles.privacyBanner, { backgroundColor: colors.primary, borderRadius: colors.radius * 1.5 }]}>
          <View style={styles.privacyRow}>
            <View style={[styles.privacyIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="shield" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.privacyTitle, { fontFamily: "Inter_700Bold" }]}>Anonymous Mentorship</Text>
              <Text style={[styles.privacySub, { fontFamily: "Inter_400Regular" }]}>Your real identity is never exposed. Connect freely without fear.</Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <Text style={[styles.yourId, { fontFamily: "Inter_500Medium" }]}>Your anonymous ID: <Text style={{ fontFamily: "Inter_700Bold" }}>{myAnonName}</Text></Text>
            <Badge label="Protected" variant="muted" size="sm" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </View>
        </View>

        {/* Apply as Mentor Banner */}
        {!myApplication ? (
          <Pressable onPress={() => setShowApplyModal(true)} style={[styles.applyBanner, { backgroundColor: colors.accent + "12", borderColor: colors.accent + "40", borderRadius: colors.radius * 1.5, borderWidth: 1 }]}>
            <View style={[styles.applyIcon, { backgroundColor: colors.accent + "20" }]}>
              <Feather name="user-check" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.applyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Become a Mentor</Text>
              <Text style={[styles.applySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Share your knowledge and help fellow students. Apply to become an approved mentor.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.accent} />
          </Pressable>
        ) : (
          <View style={[styles.applicationStatus, { backgroundColor: myApplication.status === "approved" ? colors.success + "12" : myApplication.status === "rejected" ? colors.destructive + "12" : colors.highlight + "12", borderColor: myApplication.status === "approved" ? colors.success + "40" : myApplication.status === "rejected" ? colors.destructive + "40" : colors.highlight + "40", borderRadius: colors.radius, borderWidth: 1 }]}>
            <Feather name={myApplication.status === "approved" ? "check-circle" : myApplication.status === "rejected" ? "x-circle" : "clock"} size={18} color={myApplication.status === "approved" ? colors.success : myApplication.status === "rejected" ? colors.destructive : colors.highlight} />
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }]}>Mentor Application — {myApplication.status === "approved" ? "Approved!" : myApplication.status === "rejected" ? "Not Approved" : "Pending Review"}</Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>{myApplication.status === "approved" ? "Congratulations! You are now an approved mentor." : myApplication.status === "rejected" ? "Your application was not approved this time." : "Your application is under review by admin."}</Text>
            </View>
          </View>
        )}

        {/* Sessions */}
        <View style={styles.sessionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>My Sessions ({mentorSessions.length})</Text>
          <Button onPress={() => setShowNewModal(true)} title="New Session" size="sm" />
        </View>

        {mentorSessions.length === 0 ? (
          <EmptyState icon="message-circle" title="No sessions yet" subtitle="Start an anonymous session to seek advice or offer mentorship" />
        ) : (
          mentorSessions.map((session) => (
            <Pressable key={session.id} onPress={() => setActiveSession(session)}>
              <Card style={styles.sessionCard}>
                <View style={[styles.sessionIcon, { backgroundColor: session.role === "mentor" ? colors.accent + "20" : colors.primary + "20" }]}>
                  <Feather name={session.role === "mentor" ? "user-check" : "user"} size={20} color={session.role === "mentor" ? colors.accent : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionTopic, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{session.topic}</Text>
                  <Text style={[styles.sessionMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{session.messages.length} messages • {new Date(session.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ gap: 4, alignItems: "flex-end" }}>
                  <Badge label={session.role === "mentor" ? "Mentor" : "Mentee"} variant={session.role === "mentor" ? "accent" : "primary"} size="sm" />
                  <Badge label={session.isAnon ? "Anonymous" : "Public"} variant="muted" size="sm" />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* New Session Modal */}
      <Modal visible={showNewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>New Session</Text>
              <Pressable onPress={() => setShowNewModal(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={{ gap: 16 }}>
              <View style={{ gap: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Session Topic</Text>
                <TextInput value={topic} onChangeText={setTopic} placeholder="e.g. Study strategies for final exams" placeholderTextColor={colors.mutedForeground} style={[styles.topicInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} multiline />
              </View>
              <View style={{ gap: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>I am joining as:</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {["mentee", "mentor"].map((r) => (
                    <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleBtn, { flex: 1, backgroundColor: role === r ? colors.primary : colors.muted, borderRadius: colors.radius }]}>
                      <Feather name={r === "mentor" ? "user-check" : "user"} size={16} color={role === r ? "#fff" : colors.foreground} />
                      <Text style={[styles.roleText, { color: role === r ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }]}>{r === "mentor" ? "Mentor (Helper)" : "Mentee (Learner)"}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pressable onPress={() => setIsAnon(!isAnon)} style={[styles.anonToggle, { backgroundColor: isAnon ? colors.accent + "15" : colors.muted, borderRadius: colors.radius, borderColor: isAnon ? colors.accent + "40" : colors.border, borderWidth: 1 }]}>
                <Feather name={isAnon ? "eye-off" : "eye"} size={18} color={isAnon ? colors.accent : colors.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.anonText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Anonymous Mode {isAnon ? "ON" : "OFF"}</Text>
                  <Text style={[styles.anonSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{isAnon ? `You appear as "${myAnonName}"` : "Your name will be visible"}</Text>
                </View>
                <View style={[styles.toggle, { backgroundColor: isAnon ? colors.accent : colors.mutedForeground }]}>
                  <View style={[styles.toggleDot, { left: isAnon ? 18 : 2 }]} />
                </View>
              </Pressable>
              <Button onPress={handleCreate} title="Start Session" fullWidth />
            </View>
          </View>
        </View>
      </Modal>

      {/* Apply as Mentor Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Apply as Mentor</Text>
                <Pressable onPress={() => setShowApplyModal(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
              </View>
              <View style={{ gap: 16 }}>
                <View style={[{ backgroundColor: colors.accent + "12", borderRadius: colors.radius, padding: 12, flexDirection: "row", gap: 8 }]}>
                  <Feather name="info" size={14} color={colors.accent} />
                  <Text style={[{ color: colors.accent, fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 }]}>Your application will be reviewed by the admin. You'll appear as an approved mentor once accepted.</Text>
                </View>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Area of Expertise *</Text>
                  <TextInput value={applyForm.expertise} onChangeText={(v) => setApplyForm((f) => ({ ...f, expertise: v }))} placeholder="e.g. Mathematics, Programming, Law..." placeholderTextColor={colors.mutedForeground} style={[styles.topicInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular", minHeight: 50 }]} />
                </View>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Short Bio *</Text>
                  <TextInput value={applyForm.bio} onChangeText={(v) => setApplyForm((f) => ({ ...f, bio: v }))} placeholder="Tell students why you'd be a great mentor..." placeholderTextColor={colors.mutedForeground} style={[styles.topicInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} multiline />
                </View>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Relevant Experience</Text>
                  <TextInput value={applyForm.experience} onChangeText={(v) => setApplyForm((f) => ({ ...f, experience: v }))} placeholder="Projects, achievements, academic excellence..." placeholderTextColor={colors.mutedForeground} style={[styles.topicInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} multiline />
                </View>
                <Button onPress={handleApply} title="Submit Application" fullWidth variant="accent" />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  privacyBanner: { padding: 16 },
  privacyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  privacyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  privacyTitle: { color: "#fff", fontSize: 16 },
  privacySub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  roleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  yourId: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  applyBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  applyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  applyTitle: { fontSize: 15 },
  applySub: { fontSize: 12, marginTop: 2 },
  applicationStatus: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  sessionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17 },
  sessionCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  sessionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionTopic: { fontSize: 15 },
  sessionMeta: { fontSize: 12, marginTop: 2 },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  chatTitle: { fontSize: 15 },
  chatSub: { fontSize: 12, marginTop: 2 },
  anonBadge: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  senderName: { fontSize: 11, marginBottom: 4 },
  bubble: { padding: 12, borderRadius: 16, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: "right" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  fieldLabel: { fontSize: 13 },
  topicInput: { padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: "top" },
  roleBtn: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  roleText: { fontSize: 13 },
  anonToggle: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  anonText: { fontSize: 15 },
  anonSub: { fontSize: 12, marginTop: 2 },
  toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: "center", position: "relative" },
  toggleDot: { position: "absolute", width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", top: 2 },
});
