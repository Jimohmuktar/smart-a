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
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";

const SAMPLE_STUDENTS = [
  { id: "s1", name: "Chisom Okafor", level: "400L", school: "UNILAG", skills: ["Data Science", "Python"], field: "Computer Science" },
  { id: "s2", name: "Ibrahim Musa", level: "300L", school: "ABU Zaria", skills: ["Accounting", "Excel"], field: "Accounting" },
  { id: "s3", name: "Adaeze Eze", level: "500L", school: "UNILORIN", skills: ["Medicine", "Research"], field: "Medicine" },
  { id: "s4", name: "Emeka Nwosu", level: "200L", school: "UNIPORT", skills: ["Engineering", "CAD"], field: "Mech. Engineering" },
  { id: "s5", name: "Fatima Bello", level: "400L", school: "OAU", skills: ["Law", "Debate"], field: "Law" },
  { id: "s6", name: "Tunde Adeyemi", level: "300L", school: "FUTA", skills: ["Web Dev", "React"], field: "Computer Science" },
];

export default function NetworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { posts, addPost, likePost } = useApp();
  const [tab, setTab] = useState("feed");
  const [showPost, setShowPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [connections, setConnections] = useState([]);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    await addPost({ content: postContent, author: user?.fullName || "Student", school: user?.school || "", level: user?.level || "" });
    setPostContent("");
    setShowPost(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleConnect = (id) => {
    setConnections((prev) => prev.includes(id) ? prev : [...prev, id]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Student Network</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Connect with students across Nigerian universities</Text>
      </View>

      <View style={styles.tabRow}>
        {["feed", "discover"].map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, { borderBottomColor: tab === t ? colors.primary : "transparent", borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground, fontFamily: tab === t ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{t === "feed" ? "Feed" : "Discover Students"}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "feed" ? (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 100 }}>
            {posts.length === 0 ? (
              <EmptyState icon="users" title="No posts yet" subtitle="Be the first to share something with your peers" />
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <View style={styles.postHeader}>
                    <Avatar name={post.author} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postAuthor, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{post.author}</Text>
                      <Text style={[styles.postMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{post.level} • {post.school} • {new Date(post.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.postContent, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{post.content}</Text>
                  <View style={styles.postActions}>
                    <Pressable onPress={() => likePost(post.id)} style={styles.likeBtn}>
                      <Feather name="heart" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.likeCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{post.likes}</Text>
                    </Pressable>
                    <Pressable style={styles.likeBtn}>
                      <Feather name="message-circle" size={16} color={colors.mutedForeground} />
                      <Text style={[styles.likeCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Reply</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
          <Pressable onPress={() => setShowPost(true)} style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}>
            <Feather name="edit-2" size={22} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}>
          {SAMPLE_STUDENTS.map((student) => {
            const connected = connections.includes(student.id);
            return (
              <Card key={student.id} style={styles.studentCard}>
                <Avatar name={student.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{student.name}</Text>
                  <Text style={[styles.studentInfo, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{student.level} • {student.school} • {student.field}</Text>
                  <View style={styles.skillsRow}>
                    {student.skills.map((sk) => <Badge key={sk} label={sk} variant="muted" size="sm" />)}
                  </View>
                </View>
                <Pressable onPress={() => handleConnect(student.id)} style={[styles.connectBtn, { backgroundColor: connected ? colors.success + "15" : colors.primary + "15", borderRadius: colors.radius, borderColor: connected ? colors.success : colors.primary, borderWidth: 1 }]}>
                  <Feather name={connected ? "user-check" : "user-plus"} size={14} color={connected ? colors.success : colors.primary} />
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={showPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Share with Network</Text>
              <Pressable onPress={() => setShowPost(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={styles.postInput}>
              <Avatar name={user?.fullName || "U"} size={40} />
              <TextInput value={postContent} onChangeText={setPostContent} placeholder="Share an idea, ask a question, or give advice..." placeholderTextColor={colors.mutedForeground} style={[styles.postTextField, { color: colors.foreground, fontFamily: "Inter_400Regular" }]} multiline autoFocus />
            </View>
            <Button onPress={handlePost} title="Post" fullWidth disabled={!postContent.trim()} />
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
  tabRow: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  tabText: { fontSize: 14 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  postAuthor: { fontSize: 14 },
  postMeta: { fontSize: 11, marginTop: 2 },
  postContent: { fontSize: 14, lineHeight: 21 },
  postActions: { flexDirection: "row", gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  likeCount: { fontSize: 13 },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  studentCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  studentName: { fontSize: 15 },
  studentInfo: { fontSize: 12, marginTop: 2 },
  skillsRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  connectBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20 },
  postInput: { flexDirection: "row", gap: 10, marginBottom: 16 },
  postTextField: { flex: 1, fontSize: 15, minHeight: 80, textAlignVertical: "top" },
});
