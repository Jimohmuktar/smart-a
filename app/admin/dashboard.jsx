import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { storage } from "@/utils/storage";

const ADMIN_TABS = ["Overview", "Students", "Classrooms", "Mentors", "Messages", "News", "Network"];
const GRADE_COLORS = { A: "#26A69A", B: "#5B8DEF", C: "#FFA726", D: "#FF7043", E: "#EF5350", F: "#C62828" };
const CATEGORIES = ["General", "Engineering", "Sciences", "Business", "Arts", "Law", "Medicine", "Technology"];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    courses, tasks, mentorSessions, enrolledSkills, quizScores,
    bootcampClasses, growthGoals, posts,
    addBootcampClass, deleteBootcampClass, updateBootcampClass,
    calculateGPA,
    mentorApplications, updateMentorApplication,
    adminMessages, sendAdminMessage,
    classQuestions, answerClassQuestion,
    news, addNews, deleteNews,
  } = useApp();

  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [form, setForm] = useState({ name: "", description: "", category: "General", passkey: "", schedule: "", meetingLink: "" });
  const [fileForm, setFileForm] = useState({ name: "", url: "", type: "PDF" });
  const [msgForm, setMsgForm] = useState({ title: "", body: "" });
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: "", body: "", imageUrl: "", link: "", tag: "News" });

  const gpa = calculateGPA();
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completedGoals = growthGoals.filter((g) => g.completed).length;
  const totalFiles = bootcampClasses.reduce((s, c) => s + (c.files?.length || 0), 0);
  const activeSessions = bootcampClasses.filter((c) => c.meetingLink).length;
  const bestQuiz = quizScores.length ? Math.max(...quizScores.map((q) => q.score || 0)) : 0;
  const pendingApplications = (mentorApplications || []).filter((a) => a.status === "pending").length;
  const pendingQuestions = (classQuestions || []).filter((q) => !q.answer).length;

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Sign out of admin portal?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await storage.remove("smart_a_admin_session"); router.replace("/(auth)/login"); } },
    ]);
  };

  const handleCreate = async () => {
    if (!form.name || !form.passkey) { Alert.alert("Missing Fields", "Class name and passkey are required."); return; }
    await addBootcampClass(form);
    setForm({ name: "", description: "", category: "General", passkey: "", schedule: "", meetingLink: "" });
    setShowCreate(false);
  };

  const handleAddFile = async () => {
    if (!fileForm.name || !selectedClass) return;
    const updatedFiles = [...(selectedClass.files || []), { ...fileForm, id: Date.now().toString() }];
    await updateBootcampClass(selectedClass.id, { files: updatedFiles });
    setFileForm({ name: "", url: "", type: "PDF" });
    setShowAddFile(false);
    setSelectedClass(null);
  };

  const handleSetMeeting = async () => {
    if (!meetingLinkInput.trim() || !selectedClass) return;
    await updateBootcampClass(selectedClass.id, { meetingLink: meetingLinkInput.trim() });
    setMeetingLinkInput("");
    setShowMeetingModal(false);
    setSelectedClass(null);
  };

  const handleSendMessage = async () => {
    if (!msgForm.title.trim() || !msgForm.body.trim()) return;
    await sendAdminMessage(msgForm);
    setMsgForm({ title: "", body: "" });
    setShowMessageModal(false);
  };

  const handleAnswerQuestion = async () => {
    if (!answerInput.trim() || !selectedQuestion) return;
    await answerClassQuestion(selectedQuestion.classId, selectedQuestion.id, answerInput.trim());
    setAnswerInput("");
    setShowAnswerModal(false);
    setSelectedQuestion(null);
  };

  const NEWS_TAGS = ["News", "Exams", "Finance", "Rankings", "Events", "Jobs", "Technology", "General"];

  const handlePostNews = async () => {
    if (!newsForm.title.trim()) { Alert.alert("Missing Field", "News title is required."); return; }
    await addNews({ title: newsForm.title.trim(), body: newsForm.body.trim(), imageUrl: newsForm.imageUrl.trim(), link: newsForm.link.trim(), tag: newsForm.tag });
    setNewsForm({ title: "", body: "", imageUrl: "", link: "", tag: "News" });
    setShowNewsModal(false);
  };

  const handleDeleteNews = (id, title) => {
    Alert.alert("Delete News", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteNews(id) },
    ]);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Classroom", `Delete "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteBootcampClass(id) },
    ]);
  };

  const handleApplicationAction = (id, status, name) => {
    Alert.alert(`${status === "approved" ? "Approve" : "Reject"} Application`, `${status === "approved" ? "Approve" : "Reject"} ${name}'s mentor application?`, [
      { text: "Cancel", style: "cancel" },
      { text: status === "approved" ? "Approve" : "Reject", style: status === "approved" ? "default" : "destructive", onPress: () => updateMentorApplication(id, status) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0F1E" }}>
      <LinearGradient colors={["#1A237E", "#0D47A1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.adminBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="shield" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adminTitle, { fontFamily: "Inter_700Bold" }]}>Admin Dashboard</Text>
            <Text style={[styles.adminSub, { fontFamily: "Inter_400Regular" }]}>Smart-A Academy Control Panel</Text>
          </View>
          <Pressable onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="log-out" size={18} color="#fff" />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { label: "GPA", value: gpa.toFixed(2), icon: "award" },
              { label: "Courses", value: courses.length, icon: "book" },
              { label: "Classrooms", value: bootcampClasses.length, icon: "monitor" },
              { label: "Mentors", value: pendingApplications + " pending", icon: "user-check" },
              { label: "Questions", value: pendingQuestions + " pending", icon: "help-circle" },
              { label: "Messages", value: adminMessages?.length || 0, icon: "bell" },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Feather name={s.icon} size={15} color="#fff" />
                <Text style={[styles.statValue, { fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabScroll, { backgroundColor: "#131B2E", borderBottomColor: "#1E3054" }]}>
        {ADMIN_TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, { borderBottomColor: tab === activeTab ? "#5B8DEF" : "transparent", borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === activeTab ? "#5B8DEF" : "#7B90C0", fontFamily: tab === activeTab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 50 }}>

        {/* ─── OVERVIEW ─── */}
        {activeTab === "Overview" && (
          <View style={{ gap: 12 }}>
            <View style={[styles.infoBanner, { backgroundColor: "#26A69A20", borderColor: "#26A69A40", borderRadius: colors.radius }]}>
              <Feather name="info" size={16} color="#26A69A" />
              <Text style={[styles.infoText, { color: "#26A69A", fontFamily: "Inter_400Regular" }]}>
                You have full oversight of all Smart-A features. Monitor student activity and manage academy resources below.
              </Text>
            </View>
            <View style={styles.summaryGrid}>
              {[
                { label: "Current GPA", value: gpa.toFixed(2), icon: "award", color: "#5B8DEF" },
                { label: "Courses", value: courses.length, icon: "book-open", color: "#26A69A" },
                { label: "Tasks Done", value: completedTasks, icon: "check-circle", color: "#FFA726" },
                { label: "Goals Done", value: completedGoals, icon: "star", color: "#7B1FA2" },
                { label: "Pending Apps", value: pendingApplications, icon: "user-check", color: "#FF7043" },
                { label: "Pending Qs", value: pendingQuestions, icon: "help-circle", color: "#EF5350" },
                { label: "Skills", value: enrolledSkills.length, icon: "zap", color: "#0288D1" },
                { label: "Sessions", value: mentorSessions.length, icon: "message-circle", color: "#388E3C" },
                { label: "Posts", value: posts.length, icon: "message-square", color: "#C62828" },
                { label: "Bootcamps", value: bootcampClasses.length, icon: "monitor", color: "#4527A0" },
                { label: "Live Sessions", value: activeSessions, icon: "video", color: "#00838F" },
                { label: "Total Files", value: totalFiles, icon: "file-text", color: "#546E7A" },
              ].map((s) => (
                <View key={s.label} style={[styles.summaryCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={[styles.summaryIcon, { backgroundColor: s.color + "25" }]}>
                    <Feather name={s.icon} size={18} color={s.color} />
                  </View>
                  <Text style={[styles.summaryValue, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                  <Text style={[styles.summaryLabel, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Quick Actions</Text>
            {[
              { title: "Manage Classrooms", desc: "Create, update, delete virtual bootcamp classrooms", icon: "monitor", action: () => setActiveTab("Classrooms"), color: "#5B8DEF" },
              { title: "Review Mentor Applications", desc: "Approve or reject mentor applications from students", icon: "user-check", action: () => setActiveTab("Mentors"), color: "#FFA726" },
              { title: "Send Admin Message", desc: "Broadcast a message to all students", icon: "bell", action: () => setShowMessageModal(true), color: "#26A69A" },
              { title: "View Student Activity", desc: "Review courses, tasks, quiz scores and goals", icon: "users", action: () => setActiveTab("Students"), color: "#5B8DEF" },
            ].map((item) => (
              <Pressable key={item.title} onPress={item.action}>
                <View style={[styles.actionCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={[styles.actionIcon, { backgroundColor: item.color + "25" }]}>
                    <Feather name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionTitle, { color: "#E8EEFF", fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
                    <Text style={[styles.actionDesc, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>{item.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#7B90C0" />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ─── STUDENTS ─── */}
        {activeTab === "Students" && (
          <View style={{ gap: 14 }}>
            <View style={[styles.darkCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
              <View style={styles.cardTitleRow}>
                <Feather name="award" size={18} color="#5B8DEF" />
                <Text style={[styles.cardTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Academic Performance</Text>
                <Badge label={`GPA: ${gpa.toFixed(2)}`} variant="primary" size="sm" />
              </View>
              {courses.length === 0 ? (
                <Text style={[styles.emptyNote, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>No courses tracked yet.</Text>
              ) : (
                courses.map((c) => (
                  <View key={c.id} style={[styles.rowItem, { borderBottomColor: "#1E3054" }]}>
                    <View style={[styles.gradeTag, { backgroundColor: (GRADE_COLORS[c.grade?.toUpperCase()] || "#5B8DEF") + "25" }]}>
                      <Text style={{ color: GRADE_COLORS[c.grade?.toUpperCase()] || "#5B8DEF", fontFamily: "Inter_700Bold", fontSize: 14 }}>{c.grade || "—"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#E8EEFF", fontFamily: "Inter_500Medium", fontSize: 14 }}>{c.name}</Text>
                      <Text style={{ color: "#7B90C0", fontFamily: "Inter_400Regular", fontSize: 12 }}>{c.code} · {c.units} units</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
            <View style={[styles.darkCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
              <View style={styles.cardTitleRow}>
                <Feather name="check-square" size={18} color="#FFA726" />
                <Text style={[styles.cardTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Tasks</Text>
                <Badge label={`${completedTasks}/${tasks.length} done`} variant="secondary" size="sm" />
              </View>
              {tasks.length === 0 ? (
                <Text style={[styles.emptyNote, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>No tasks created yet.</Text>
              ) : (
                tasks.slice(0, 8).map((t) => (
                  <View key={t.id} style={[styles.rowItem, { borderBottomColor: "#1E3054" }]}>
                    <Feather name={t.completed ? "check-circle" : "circle"} size={16} color={t.completed ? "#26A69A" : "#7B90C0"} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#E8EEFF", fontFamily: "Inter_500Medium", fontSize: 13, textDecorationLine: t.completed ? "line-through" : "none" }}>{t.title}</Text>
                      <Text style={{ color: "#7B90C0", fontFamily: "Inter_400Regular", fontSize: 11 }}>{t.category} · {t.priority} priority</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* ─── CLASSROOMS ─── */}
        {activeTab === "Classrooms" && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Bootcamp Classrooms</Text>
              <Pressable onPress={() => setShowCreate(true)} style={[styles.createBtn, { backgroundColor: "#1565C0" }]}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={[styles.createText, { fontFamily: "Inter_600SemiBold" }]}>Create</Text>
              </Pressable>
            </View>
            {bootcampClasses.length === 0 ? (
              <View style={[{ backgroundColor: "#131B2E", borderRadius: colors.radius, padding: 20 }]}>
                <EmptyState icon="monitor" title="No classrooms yet" subtitle="Create your first bootcamp classroom to get started" />
              </View>
            ) : (
              bootcampClasses.map((cls) => (
                <View key={cls.id} style={[styles.classCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={styles.classTop}>
                    <View style={[styles.classIcon, { backgroundColor: "#1565C025" }]}>
                      <Feather name="monitor" size={20} color="#5B8DEF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.className, { color: "#E8EEFF", fontFamily: "Inter_600SemiBold" }]}>{cls.name}</Text>
                      <Text style={[styles.classDesc, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]} numberOfLines={1}>{cls.description}</Text>
                    </View>
                    <Pressable onPress={() => handleDelete(cls.id, cls.name)} style={[styles.deleteBtn, { backgroundColor: "#C6282825" }]}>
                      <Feather name="trash-2" size={15} color="#EF5350" />
                    </Pressable>
                  </View>
                  <View style={styles.classMeta}>
                    <Badge label={cls.category} variant="primary" size="sm" />
                    <View style={styles.passkeyRow}>
                      <Feather name="key" size={12} color="#7B90C0" />
                      <Text style={[styles.passkey, { color: "#7B90C0", fontFamily: "Inter_500Medium" }]}>Key: {cls.passkey}</Text>
                    </View>
                    <Text style={[styles.fileCount, { color: "#7B90C0", fontFamily: "Inter_400Regular" }]}>{cls.files?.length || 0} files</Text>
                  </View>
                  {cls.meetingLink ? (
                    <View style={[styles.meetingRow, { backgroundColor: "#26A69A20" }]}>
                      <Feather name="video" size={14} color="#26A69A" />
                      <Text style={{ color: "#26A69A", fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 }} numberOfLines={1}>{cls.meetingLink}</Text>
                    </View>
                  ) : null}
                  {cls.files?.length > 0 && (
                    <View style={{ marginTop: 6, gap: 4 }}>
                      {cls.files.map((f) => (
                        <View key={f.id} style={[styles.fileRow, { backgroundColor: "#1A2540" }]}>
                          <Feather name="file-text" size={12} color="#7B90C0" />
                          <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 }} numberOfLines={1}>{f.name}</Text>
                          <Text style={{ color: "#5B6B8A", fontFamily: "Inter_400Regular", fontSize: 11 }}>{f.type}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {/* Class Questions */}
                  {(classQuestions || []).filter((q) => q.classId === cls.id).length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ color: "#5B8DEF", fontFamily: "Inter_600SemiBold", fontSize: 12, marginBottom: 6 }}>
                        Student Questions ({(classQuestions || []).filter((q) => q.classId === cls.id).length})
                      </Text>
                      {(classQuestions || []).filter((q) => q.classId === cls.id).map((q) => (
                        <View key={q.id} style={[styles.questionRow, { backgroundColor: "#1A2540" }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: "#A0B0D0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{q.studentName}: {q.question}</Text>
                            {q.answer ? <Text style={{ color: "#26A69A", fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 }}>✓ {q.answer}</Text> : null}
                          </View>
                          {!q.answer && (
                            <Pressable onPress={() => { setSelectedQuestion(q); setShowAnswerModal(true); }} style={[styles.answerBtn, { backgroundColor: "#5B8DEF25" }]}>
                              <Text style={{ color: "#5B8DEF", fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Answer</Text>
                            </Pressable>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <Pressable onPress={() => { setSelectedClass(cls); setShowAddFile(true); }} style={[styles.adminAction, { backgroundColor: "#26A69A20", flex: 1, borderRadius: 8 }]}>
                      <Feather name="file-plus" size={14} color="#26A69A" />
                      <Text style={[styles.adminActionText, { color: "#26A69A" }]}>Add File</Text>
                    </Pressable>
                    <Pressable onPress={() => { setSelectedClass(cls); setMeetingLinkInput(cls.meetingLink || ""); setShowMeetingModal(true); }} style={[styles.adminAction, { backgroundColor: "#5B8DEF20", flex: 1, borderRadius: 8 }]}>
                      <Feather name="video" size={14} color="#5B8DEF" />
                      <Text style={[styles.adminActionText, { color: "#5B8DEF" }]}>Set Link</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── MENTORS ─── */}
        {activeTab === "Mentors" && (
          <View style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Mentor Applications</Text>
            {(mentorApplications || []).length === 0 ? (
              <View style={[{ backgroundColor: "#131B2E", borderRadius: colors.radius, padding: 20 }]}>
                <EmptyState icon="user-check" title="No applications yet" subtitle="Students who apply as mentors will appear here for your review" />
              </View>
            ) : (
              (mentorApplications || []).map((app) => (
                <View key={app.id} style={[styles.classCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={styles.classTop}>
                    <Avatar name={app.studentName} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#E8EEFF", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{app.studentName}</Text>
                      <Text style={{ color: "#7B90C0", fontFamily: "Inter_400Regular", fontSize: 12 }}>{app.level} • {app.school}</Text>
                    </View>
                    <Badge
                      label={app.status === "pending" ? "Pending" : app.status === "approved" ? "Approved" : "Rejected"}
                      variant={app.status === "approved" ? "accent" : app.status === "rejected" ? "destructive" : "muted"}
                      size="sm"
                    />
                  </View>
                  <View style={{ gap: 6, marginTop: 8 }}>
                    <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Area of Expertise:</Text>
                    <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 13 }}>{app.expertise}</Text>
                    <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Why they want to mentor:</Text>
                    <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 13 }}>{app.reason}</Text>
                    <Text style={{ color: "#5B6B8A", fontFamily: "Inter_400Regular", fontSize: 11 }}>Applied {new Date(app.createdAt).toLocaleDateString()}</Text>
                  </View>
                  {app.status === "pending" && (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                      <Pressable onPress={() => handleApplicationAction(app.id, "approved", app.studentName)} style={[styles.adminAction, { backgroundColor: "#26A69A25", flex: 1, borderRadius: 8 }]}>
                        <Feather name="check" size={14} color="#26A69A" />
                        <Text style={[styles.adminActionText, { color: "#26A69A" }]}>Approve</Text>
                      </Pressable>
                      <Pressable onPress={() => handleApplicationAction(app.id, "rejected", app.studentName)} style={[styles.adminAction, { backgroundColor: "#EF535025", flex: 1, borderRadius: 8 }]}>
                        <Feather name="x" size={14} color="#EF5350" />
                        <Text style={[styles.adminActionText, { color: "#EF5350" }]}>Reject</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── MESSAGES ─── */}
        {activeTab === "Messages" && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Admin Messages</Text>
              <Pressable onPress={() => setShowMessageModal(true)} style={[styles.createBtn, { backgroundColor: "#26A69A" }]}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={[styles.createText, { fontFamily: "Inter_600SemiBold" }]}>New</Text>
              </Pressable>
            </View>
            <View style={[styles.infoBanner, { backgroundColor: "#5B8DEF18", borderColor: "#5B8DEF30", borderRadius: colors.radius }]}>
              <Feather name="info" size={14} color="#5B8DEF" />
              <Text style={{ color: "#5B8DEF", fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 }}>Messages sent here are visible to all students in the More tab and Profile screen.</Text>
            </View>
            {(adminMessages || []).length === 0 ? (
              <View style={[{ backgroundColor: "#131B2E", borderRadius: colors.radius, padding: 20 }]}>
                <EmptyState icon="bell" title="No messages sent yet" subtitle="Send your first admin message to all students" />
              </View>
            ) : (
              (adminMessages || []).slice().reverse().map((msg) => (
                <View key={msg.id} style={[styles.classCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={styles.cardTitleRow}>
                    <Feather name="bell" size={16} color="#5B8DEF" />
                    <Text style={{ color: "#E8EEFF", fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 }}>{msg.title}</Text>
                    <Text style={{ color: "#5B6B8A", fontFamily: "Inter_400Regular", fontSize: 11 }}>{new Date(msg.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 6 }}>{msg.body}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── NEWS ─── */}
        {activeTab === "News" && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Academic News Feed</Text>
              <Pressable onPress={() => setShowNewsModal(true)} style={[styles.createBtn, { backgroundColor: "#FF8F00" }]}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={[styles.createText, { fontFamily: "Inter_600SemiBold" }]}>Post</Text>
              </Pressable>
            </View>
            <View style={[styles.infoBanner, { backgroundColor: "#FF8F0018", borderColor: "#FF8F0030", borderRadius: colors.radius }]}>
              <Feather name="info" size={14} color="#FF8F00" />
              <Text style={{ color: "#FF8F00", fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 }}>News items posted here appear on every student's dashboard feed in real-time.</Text>
            </View>
            {(news || []).length === 0 ? (
              <View style={[{ backgroundColor: "#131B2E", borderRadius: colors.radius, padding: 20 }]}>
                <EmptyState icon="rss" title="No news posted yet" subtitle="Post academic news, exam updates, or flyers for students to see on their dashboard" />
              </View>
            ) : (
              (news || []).map((item) => (
                <View key={item.id} style={[styles.classCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  {item.imageUrl ? (
                    <View style={{ borderRadius: 8, overflow: "hidden", height: 150, backgroundColor: "#1A2540" }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </View>
                  ) : null}
                  <View style={styles.cardTitleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#E8EEFF", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{item.title}</Text>
                      {item.body ? <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, lineHeight: 17 }} numberOfLines={3}>{item.body}</Text> : null}
                    </View>
                    <Pressable onPress={() => handleDeleteNews(item.id, item.title)} style={[styles.deleteBtn, { backgroundColor: "#C6282825" }]}>
                      <Feather name="trash-2" size={14} color="#EF5350" />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Badge label={item.tag || "News"} variant="warning" size="sm" />
                    <Text style={{ color: "#5B6B8A", fontFamily: "Inter_400Regular", fontSize: 11 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    {item.link ? (
                      <Text style={{ color: "#5B8DEF", fontFamily: "Inter_400Regular", fontSize: 11 }} numberOfLines={1}>🔗 {item.link}</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── NETWORK ─── */}
        {activeTab === "Network" && (
          <View style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Student Network Posts ({posts.length})</Text>
            {posts.length === 0 ? (
              <View style={[{ backgroundColor: "#131B2E", borderRadius: colors.radius, padding: 20 }]}>
                <EmptyState icon="message-square" title="No posts yet" subtitle="Students haven't posted anything yet" />
              </View>
            ) : (
              posts.slice().reverse().map((post) => (
                <View key={post.id} style={[styles.classCard, { backgroundColor: "#131B2E", borderColor: "#1E3054" }]}>
                  <View style={styles.cardTitleRow}>
                    <Avatar name={post.author} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#E8EEFF", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{post.author}</Text>
                      <Text style={{ color: "#7B90C0", fontFamily: "Inter_400Regular", fontSize: 11 }}>{post.level} • {post.school}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="heart" size={13} color="#EF5350" />
                      <Text style={{ color: "#EF5350", fontFamily: "Inter_500Medium", fontSize: 12 }}>{post.likes}</Text>
                    </View>
                  </View>
                  <Text style={{ color: "#A0B0D0", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 8, lineHeight: 18 }}>{post.content}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Classroom Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Create Classroom</Text>
              <Pressable onPress={() => setShowCreate(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              {[
                { label: "Class Name *", field: "name", placeholder: "e.g. Python for Beginners" },
                { label: "Description", field: "description", placeholder: "What will students learn?" },
                { label: "Passkey *", field: "passkey", placeholder: "Secret passkey for students to join" },
                { label: "Schedule", field: "schedule", placeholder: "e.g. Mon/Wed 4pm" },
              ].map((f) => (
                <View key={f.field} style={{ gap: 5 }}>
                  <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{f.label}</Text>
                  <TextInput value={form[f.field]} onChangeText={(v) => setForm((p) => ({ ...p, [f.field]: v }))} placeholder={f.placeholder} placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} />
                </View>
              ))}
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {CATEGORIES.map((cat) => (
                      <Pressable key={cat} onPress={() => setForm((p) => ({ ...p, category: cat }))} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: form.category === cat ? "#1565C0" : "#1A2540" }}>
                        <Text style={{ color: form.category === cat ? "#fff" : "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{cat}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <Button onPress={handleCreate} title="Create Classroom" fullWidth style={{ backgroundColor: "#1565C0", marginTop: 8 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add File Modal */}
      <Modal visible={showAddFile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Add File</Text>
              <Pressable onPress={() => setShowAddFile(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              {[
                { label: "File Name *", field: "name", placeholder: "e.g. Week 1 Notes" },
                { label: "URL", field: "url", placeholder: "https://..." },
              ].map((f) => (
                <View key={f.field} style={{ gap: 5 }}>
                  <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{f.label}</Text>
                  <TextInput value={fileForm[f.field]} onChangeText={(v) => setFileForm((p) => ({ ...p, [f.field]: v }))} placeholder={f.placeholder} placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} />
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["PDF", "Video", "Slides", "Link"].map((t) => (
                  <Pressable key={t} onPress={() => setFileForm((p) => ({ ...p, type: t }))} style={{ flex: 1, height: 38, borderRadius: 8, backgroundColor: fileForm.type === t ? "#1565C0" : "#1A2540", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: fileForm.type === t ? "#fff" : "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <Button onPress={handleAddFile} title="Add File" fullWidth style={{ backgroundColor: "#26A69A" }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Meeting Link Modal */}
      <Modal visible={showMeetingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Set Meeting Link</Text>
              <Pressable onPress={() => setShowMeetingModal(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              <TextInput value={meetingLinkInput} onChangeText={setMeetingLinkInput} placeholder="https://meet.google.com/..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} autoCapitalize="none" />
              <Button onPress={handleSetMeeting} title="Update Meeting Link" fullWidth style={{ backgroundColor: "#1565C0" }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Admin Message Modal */}
      <Modal visible={showMessageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Send Admin Message</Text>
              <Pressable onPress={() => setShowMessageModal(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Message Title *</Text>
                <TextInput value={msgForm.title} onChangeText={(v) => setMsgForm((p) => ({ ...p, title: v }))} placeholder="e.g. Important Notice" placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} />
              </View>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Message Body *</Text>
                <TextInput value={msgForm.body} onChangeText={(v) => setMsgForm((p) => ({ ...p, body: v }))} placeholder="Type your message to all students..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF", minHeight: 80, textAlignVertical: "top" }]} multiline />
              </View>
              <Button onPress={handleSendMessage} title="Send to All Students" fullWidth style={{ backgroundColor: "#26A69A" }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Answer Question Modal */}
      <Modal visible={showAnswerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Answer Question</Text>
              <Pressable onPress={() => setShowAnswerModal(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            {selectedQuestion && (
              <View style={{ gap: 12 }}>
                <View style={{ backgroundColor: "#1A2540", borderRadius: 8, padding: 12 }}>
                  <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Question from {selectedQuestion.studentName}:</Text>
                  <Text style={{ color: "#E8EEFF", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>{selectedQuestion.question}</Text>
                </View>
                <TextInput value={answerInput} onChangeText={setAnswerInput} placeholder="Type your answer..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF", minHeight: 80, textAlignVertical: "top" }]} multiline autoFocus />
                <Button onPress={handleAnswerQuestion} title="Submit Answer" fullWidth style={{ backgroundColor: "#26A69A" }} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Post News Modal */}
      <Modal visible={showNewsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: "#131B2E" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: "#E8EEFF", fontFamily: "Inter_700Bold" }]}>Post News</Text>
              <Pressable onPress={() => setShowNewsModal(false)}><Feather name="x" size={22} color="#7B90C0" /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Headline *</Text>
                <TextInput value={newsForm.title} onChangeText={(v) => setNewsForm((p) => ({ ...p, title: v }))} placeholder="e.g. JAMB extends registration deadline" placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} />
              </View>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Body (optional)</Text>
                <TextInput value={newsForm.body} onChangeText={(v) => setNewsForm((p) => ({ ...p, body: v }))} placeholder="More details about this news..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF", minHeight: 70, textAlignVertical: "top" }]} multiline />
              </View>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Image URL (optional — flyer/banner)</Text>
                <TextInput value={newsForm.imageUrl} onChangeText={(v) => setNewsForm((p) => ({ ...p, imageUrl: v }))} placeholder="https://..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} autoCapitalize="none" />
              </View>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Source Link (optional)</Text>
                <TextInput value={newsForm.link} onChangeText={(v) => setNewsForm((p) => ({ ...p, link: v }))} placeholder="https://..." placeholderTextColor="#3A4A6A" style={[styles.darkInput, { color: "#E8EEFF" }]} autoCapitalize="none" />
              </View>
              <View style={{ gap: 5 }}>
                <Text style={{ color: "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {NEWS_TAGS.map((tag) => (
                      <Pressable key={tag} onPress={() => setNewsForm((p) => ({ ...p, tag }))} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: newsForm.tag === tag ? "#FF8F00" : "#1A2540" }}>
                        <Text style={{ color: newsForm.tag === tag ? "#fff" : "#7B90C0", fontFamily: "Inter_500Medium", fontSize: 12 }}>{tag}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <Button onPress={handlePostNews} title="Publish News" fullWidth style={{ backgroundColor: "#FF8F00", marginTop: 4 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  adminBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adminTitle: { color: "#fff", fontSize: 20 },
  adminSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  logoutBtn: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statBox: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: "center", gap: 3, minWidth: 80 },
  statValue: { color: "#fff", fontSize: 16 },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
  tabScroll: { borderBottomWidth: 1 },
  tab: { paddingHorizontal: 18, paddingVertical: 12 },
  tabText: { fontSize: 13 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryCard: { width: "30%", alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1, gap: 5 },
  summaryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  summaryValue: { fontSize: 18 },
  summaryLabel: { fontSize: 10, textAlign: "center" },
  sectionTitle: { fontSize: 16, marginBottom: 4 },
  actionCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  actionIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionTitle: { fontSize: 14 },
  actionDesc: { fontSize: 12, marginTop: 2 },
  darkCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 14, flex: 1 },
  emptyNote: { fontSize: 13, textAlign: "center", paddingVertical: 8 },
  moreNote: { fontSize: 12, textAlign: "center", marginTop: 4 },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  gradeTag: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  scoreTag: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sessionDot: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  classCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  classTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  classIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  className: { fontSize: 14 },
  classDesc: { fontSize: 12, marginTop: 2 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  classMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  passkeyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  passkey: { fontSize: 12 },
  fileCount: { fontSize: 12 },
  meetingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  fileRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderRadius: 6 },
  adminAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8 },
  adminActionText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  questionRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 8, borderRadius: 6, marginBottom: 4 },
  answerBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  darkInput: { backgroundColor: "#1A2540", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 8 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  createText: { color: "#fff", fontSize: 13 },
});
