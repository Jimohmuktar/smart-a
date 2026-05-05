import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { MOTIVATIONAL_QUOTES } from "@/utils/quiz-data";

const QUICK_ACTIONS = [
  { label: "Quiz", icon: "help-circle", route: "/quiz", color: "#7B1FA2" },
  { label: "AI Tutor", icon: "cpu", route: "/ai-chat", color: "#00897B" },
  { label: "Skills", icon: "award", route: "/skills", color: "#E65100" },
  { label: "Bootcamp", icon: "video", route: "/bootcamp", color: "#1565C0" },
  { label: "Network", icon: "users", route: "/network", color: "#2E7D32" },
  { label: "Career", icon: "trending-up", route: "/career", color: "#C62828" },
  { label: "Growth", icon: "star", route: "/growth", color: "#FF8F00" },
  { label: "Profile", icon: "user", route: "/profile", color: "#546E7A" },
];

function timeAgo(isoDate) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { courses, tasks, calculateGPA, mentorSessions, quizScores, news } = useApp();

  const gpa = calculateGPA();
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const quote = MOTIVATIONAL_QUOTES[today.getDate() % MOTIVATIONAL_QUOTES.length];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerGrad, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>{greeting},</Text>
            <Text style={[styles.userName, { fontFamily: "Inter_700Bold" }]} numberOfLines={1}>{user?.fullName?.split(" ")[0] || "Student"}</Text>
            <View style={styles.levelBadgeRow}>
              <Badge label={user?.level || "Student"} variant="muted" size="sm" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
              <Badge label={user?.school?.split(" ").slice(-1)[0] || "University"} variant="muted" size="sm" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
            </View>
          </View>
          <Avatar name={user?.fullName || "S"} size={52} color="rgba(255,255,255,0.3)" />
        </View>

        <View style={[styles.gpaCard, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpaLabel, { fontFamily: "Inter_500Medium" }]}>Current GPA</Text>
            <Text style={[styles.gpaValue, { fontFamily: "Inter_700Bold" }]}>{gpa.toFixed(2)} / 5.00</Text>
            <ProgressBar progress={gpa / 5} height={6} color="#fff" style={{ marginTop: 8 }} />
          </View>
          <View style={styles.gpaSep} />
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.gpaStatNum, { fontFamily: "Inter_700Bold" }]}>{courses.length}</Text>
            <Text style={[styles.gpaStatLabel, { fontFamily: "Inter_400Regular" }]}>Courses</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ padding: 16, gap: 16 }}>
        <View style={styles.statsRow}>
          {[
            { label: "Pending Tasks", value: pendingTasks, icon: "check-square", color: colors.primary },
            { label: "Mentor Chats", value: mentorSessions.length, icon: "message-circle", color: colors.accent },
            { label: "Quiz Scores", value: quizScores.length, icon: "zap", color: colors.highlight },
          ].map((stat) => (
            <Card key={stat.label} style={{ flex: 1 }}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + "15" }]}>
                <Feather name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <LinearGradient colors={[colors.primary + "18", colors.accent + "18"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.quoteCard, { borderRadius: colors.radius, borderColor: colors.primary + "30", borderWidth: 1 }]}>
          <Feather name="zap" size={18} color={colors.primary} />
          <Text style={[styles.quoteText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>"{quote.quote}"</Text>
          <Text style={[styles.quoteAuthor, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>— {quote.author}</Text>
        </LinearGradient>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Quick Access</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable key={action.label} onPress={() => router.push(action.route)} style={({ pressed }) => [styles.actionItem, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + "18" }]}>
                  <Feather name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {tasks.filter((t) => !t.completed).length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Pending Tasks</Text>
              <Pressable onPress={() => router.push("/(tabs)/planner")}>
                <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>View All</Text>
              </Pressable>
            </View>
            <View style={{ gap: 8 }}>
              {tasks.filter((t) => !t.completed).slice(0, 3).map((task) => (
                <Card key={task.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.taskDot, { backgroundColor: task.priority === "High" ? colors.destructive : task.priority === "Medium" ? colors.highlight : colors.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{task.title}</Text>
                    <Text style={[styles.taskDue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{task.dueDate || "No due date"}</Text>
                  </View>
                  <Badge label={task.priority || "Normal"} variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "warning" : "accent"} size="sm" />
                </Card>
              ))}
            </View>
          </View>
        )}

        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Academic News</Text>
            {news.length > 0 && (
              <View style={[styles.newsBadge, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="rss" size={12} color={colors.primary} />
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Live</Text>
              </View>
            )}
          </View>

          {news.length === 0 ? (
            <View style={[styles.emptyNews, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyNewsIcon, { backgroundColor: colors.primary + "12" }]}>
                <Feather name="rss" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyNewsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No news posted yet</Text>
              <Text style={[styles.emptyNewsSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Admin-posted academic news and updates will appear here.</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {news.map((item) => (
                <Card key={item.id} style={{ gap: 0, padding: 0, overflow: "hidden" }}>
                  {item.imageUrl ? (
                    <View style={[styles.newsImage, { backgroundColor: colors.muted }]}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </View>
                  ) : null}
                  <View style={{ padding: 14, gap: 8 }}>
                    <Text style={[styles.newsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
                    {item.body ? (
                      <Text style={[styles.newsBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>{item.body}</Text>
                    ) : null}
                    <View style={styles.newsMeta}>
                      <Badge label={item.tag || "News"} variant="primary" size="sm" />
                      <Text style={[styles.newsTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{timeAgo(item.createdAt)}</Text>
                      {item.link ? (
                        <Pressable onPress={() => { try { window.open(item.link, "_blank"); } catch {} }} style={[styles.readMore, { backgroundColor: colors.primary + "12" }]}>
                          <Feather name="external-link" size={11} color={colors.primary} />
                          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>Read More</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerGrad: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  greeting: { color: "rgba(255,255,255,0.85)", fontSize: 15 },
  userName: { color: "#fff", fontSize: 26 },
  levelBadgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  gpaCard: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  gpaLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  gpaValue: { color: "#fff", fontSize: 22, marginTop: 2 },
  gpaSep: { width: 1, height: 48, backgroundColor: "rgba(255,255,255,0.3)" },
  gpaStatNum: { color: "#fff", fontSize: 22 },
  gpaStatLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11, marginTop: 2 },
  quoteCard: { padding: 16, gap: 8 },
  quoteText: { fontSize: 14, lineHeight: 21, fontStyle: "italic" },
  quoteAuthor: { fontSize: 13 },
  sectionTitle: { fontSize: 17, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  seeAll: { fontSize: 14 },
  newsBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionItem: { width: "22%", alignItems: "center", padding: 10, borderWidth: 1, gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, textAlign: "center" },
  taskDot: { width: 10, height: 10, borderRadius: 5 },
  taskTitle: { fontSize: 14 },
  taskDue: { fontSize: 12, marginTop: 2 },
  emptyNews: { borderRadius: 14, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
  emptyNewsIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  emptyNewsTitle: { fontSize: 15 },
  emptyNewsSub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  newsImage: { width: "100%", height: 160 },
  newsTitle: { fontSize: 14, lineHeight: 20 },
  newsBody: { fontSize: 13, lineHeight: 18 },
  newsMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  newsTime: { fontSize: 11 },
  readMore: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
