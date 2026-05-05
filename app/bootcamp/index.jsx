import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

export default function BootcampScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bootcampClasses, classQuestions, addClassQuestion, answerClassQuestion } = useApp();
  const [showJoin, setShowJoin] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [passkey, setPasskey] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [detailClass, setDetailClass] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [showAskModal, setShowAskModal] = useState(false);

  const handleJoin = () => {
    if (!selectedClass) return;
    if (passkey !== selectedClass.passkey) {
      setPasskeyError("Incorrect passkey. Please contact the admin.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setJoinedClasses((prev) => [...prev, selectedClass.id]);
    setPasskey("");
    setPasskeyError("");
    setShowJoin(false);
    setDetailClass(selectedClass);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !detailClass) return;
    await addClassQuestion(detailClass.id, {
      question: newQuestion.trim(),
      studentName: user?.fullName || "Student",
    });
    setNewQuestion("");
    setShowAskModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const classQs = detailClass ? (classQuestions || []).filter((q) => q.classId === detailClass.id) : [];

  if (detailClass) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Pressable onPress={() => setDetailClass(null)} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]} numberOfLines={1}>{detailClass.name}</Text>
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{detailClass.instructor || "Smart-A Instructor"}</Text>
          </View>
          <Badge label="Joined" variant="muted" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}>
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>Class Details</Text>
            <Text style={[styles.classDesc, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{detailClass.description}</Text>
            <View style={styles.metaRow}>
              <Badge label={detailClass.category || "General"} variant="primary" size="sm" />
              {detailClass.schedule && (
                <View style={styles.schedRow}>
                  <Feather name="calendar" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.schedText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{detailClass.schedule}</Text>
                </View>
              )}
            </View>
          </Card>

          {detailClass.meetingLink ? (
            <Card style={{ backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }}>
              <View style={styles.meetRow}>
                <View style={[styles.meetIcon, { backgroundColor: colors.accent + "20" }]}>
                  <Feather name="video" size={24} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.meetTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Virtual Classroom</Text>
                  <Text style={[styles.meetSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{detailClass.meetingLink}</Text>
                </View>
              </View>
              <Button onPress={() => {}} title="Join Live Session" variant="accent" fullWidth style={{ marginTop: 12 }} />
            </Card>
          ) : (
            <Card style={{ backgroundColor: colors.muted }}>
              <EmptyState icon="video" title="No live session scheduled" subtitle="The admin will add a meeting link when a session starts" />
            </Card>
          )}

          <Card>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>Materials & Resources</Text>
            {(!detailClass.files || detailClass.files.length === 0) ? (
              <EmptyState icon="file-text" title="No materials yet" subtitle="The admin will upload course materials here" />
            ) : (
              detailClass.files.map((file) => (
                <View key={file.id} style={[styles.fileRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.fileIcon, { backgroundColor: colors.primary + "15" }]}><Feather name="file-text" size={18} color={colors.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fileName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{file.name}</Text>
                    <Text style={[styles.fileType, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{file.type || "Document"}</Text>
                  </View>
                  <Feather name="download" size={18} color={colors.primary} />
                </View>
              ))
            )}
          </Card>

          {/* Student Questions Section */}
          <Card>
            <View style={[styles.qHeader, { marginBottom: 14 }]}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Questions ({classQs.length})</Text>
                <Text style={[styles.qSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Ask your instructor anything about this class</Text>
              </View>
              <Button onPress={() => setShowAskModal(true)} title="Ask" size="sm" />
            </View>

            {classQs.length === 0 ? (
              <EmptyState icon="help-circle" title="No questions yet" subtitle="Be the first to ask a question in this classroom!" />
            ) : (
              <View style={{ gap: 12 }}>
                {classQs.map((q) => (
                  <View key={q.id} style={[styles.questionItem, { backgroundColor: colors.muted, borderRadius: colors.radius, borderLeftColor: q.answer ? colors.accent : colors.primary, borderLeftWidth: 3 }]}>
                    <View style={styles.qItemHeader}>
                      <Avatar name={q.studentName} size={28} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.qStudentName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{q.studentName}</Text>
                        <Text style={[styles.qTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{new Date(q.createdAt).toLocaleDateString()}</Text>
                      </View>
                      <Badge label={q.answer ? "Answered" : "Pending"} variant={q.answer ? "accent" : "muted"} size="sm" />
                    </View>
                    <Text style={[styles.qText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{q.question}</Text>
                    {q.answer ? (
                      <View style={[styles.answerBox, { backgroundColor: colors.accent + "12", borderRadius: colors.radius - 2 }]}>
                        <View style={styles.answerHeader}>
                          <Feather name="check-circle" size={14} color={colors.accent} />
                          <Text style={[styles.answerLabel, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>Instructor's Answer</Text>
                        </View>
                        <Text style={[styles.answerText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{q.answer}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>

        {/* Ask Question Modal */}
        <Modal visible={showAskModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Ask a Question</Text>
                <Pressable onPress={() => { setShowAskModal(false); setNewQuestion(""); }}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <View style={{ gap: 14 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Your Question</Text>
                <TextInput
                  value={newQuestion}
                  onChangeText={setNewQuestion}
                  placeholder="Type your question here..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textArea, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]}
                  multiline
                  autoFocus
                />
                <Button onPress={handleAskQuestion} title="Submit Question" fullWidth disabled={!newQuestion.trim()} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Bootcamp Classrooms</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Virtual learning spaces created by admin</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.infoBanner, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30", borderRadius: colors.radius }]}>
          <Feather name="info" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>Classrooms are created by the admin. You need a passkey to join. Contact admin at admin01smart.academy@gmail.com</Text>
        </View>

        {bootcampClasses.length === 0 ? (
          <EmptyState icon="video" title="No classrooms available" subtitle="The admin hasn't created any bootcamp sessions yet. Check back soon!" />
        ) : (
          bootcampClasses.map((cls) => {
            const joined = joinedClasses.includes(cls.id);
            return (
              <Card key={cls.id} style={styles.classCard}>
                <View style={[styles.classIconBox, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="monitor" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.className, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{cls.name}</Text>
                  <Text style={[styles.classDesc2, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{cls.description}</Text>
                  <View style={styles.classMetaRow}>
                    <Badge label={cls.category || "General"} variant="primary" size="sm" />
                    {cls.schedule && <Badge label={cls.schedule} variant="muted" size="sm" />}
                  </View>
                </View>
                <Pressable
                  onPress={() => { if (joined) { setDetailClass(cls); } else { setSelectedClass(cls); setShowJoin(true); } }}
                  style={[styles.joinBtn, { backgroundColor: joined ? colors.success + "20" : colors.primary, borderRadius: colors.radius }]}
                >
                  <Feather name={joined ? "check" : "unlock"} size={14} color={joined ? colors.success : "#fff"} />
                  <Text style={[styles.joinText, { color: joined ? colors.success : "#fff", fontFamily: "Inter_600SemiBold" }]}>{joined ? "Joined" : "Join"}</Text>
                </Pressable>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showJoin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Enter Passkey</Text>
              <Pressable onPress={() => { setShowJoin(false); setPasskey(""); setPasskeyError(""); }}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            {selectedClass && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.joinClass, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Joining: <Text style={{ fontFamily: "Inter_700Bold" }}>{selectedClass.name}</Text></Text>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Classroom Passkey</Text>
                  <TextInput value={passkey} onChangeText={(v) => { setPasskey(v); setPasskeyError(""); }} placeholder="Enter passkey from admin" placeholderTextColor={colors.mutedForeground} secureTextEntry style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, borderColor: passkeyError ? colors.destructive : colors.border, borderWidth: 1.5, fontFamily: "Inter_400Regular" }]} />
                  {passkeyError ? <Text style={[styles.errText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{passkeyError}</Text> : null}
                </View>
                <Button onPress={handleJoin} title="Join Classroom" fullWidth />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  classCard: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  classIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  className: { fontSize: 15 },
  classDesc2: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  classMetaRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  joinBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  joinText: { fontSize: 12 },
  sectionTitle: { fontSize: 16 },
  classDesc: { fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  schedRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  schedText: { fontSize: 12 },
  meetRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  meetIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  meetTitle: { fontSize: 15 },
  meetSub: { fontSize: 12, marginTop: 2 },
  fileRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  fileIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fileName: { fontSize: 14 },
  fileType: { fontSize: 12, marginTop: 2 },
  qHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  qSubtitle: { fontSize: 12, marginTop: 2 },
  questionItem: { padding: 12 },
  qItemHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  qStudentName: { fontSize: 13 },
  qTime: { fontSize: 11, marginTop: 1 },
  qText: { fontSize: 14, lineHeight: 20 },
  answerBox: { marginTop: 10, padding: 10 },
  answerHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  answerLabel: { fontSize: 12 },
  answerText: { fontSize: 13, lineHeight: 19 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  joinClass: { fontSize: 15 },
  fieldLabel: { fontSize: 13 },
  textField: { height: 50, paddingHorizontal: 14, fontSize: 15 },
  textArea: { minHeight: 100, padding: 14, fontSize: 15, textAlignVertical: "top" },
  errText: { fontSize: 12 },
});
