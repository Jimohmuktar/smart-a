import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MOTIVATIONAL_QUOTES } from "@/utils/quiz-data";

const AFFIRMATIONS = [
  "I am capable of achieving academic excellence",
  "My hard work today creates success tomorrow",
  "Every challenge I face makes me stronger and wiser",
  "I have the intelligence and discipline to reach my goals",
  "Success is my birthright — I claim it with action",
  "My degree is only the beginning of my great journey",
  "I attract opportunities by consistently showing up",
];

const HABIT_SUGGESTIONS = [
  { title: "Daily Reading", desc: "Read for at least 30 mins every day", icon: "book-open" },
  { title: "Morning Review", desc: "Review yesterday's notes every morning", icon: "sun" },
  { title: "Weekly Planning", desc: "Plan your week every Sunday evening", icon: "calendar" },
  { title: "Exercise", desc: "30 mins of physical activity daily", icon: "activity" },
  { title: "No Phone Study Hours", desc: "2 hours phone-free study sessions", icon: "smartphone" },
];

export default function GrowthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { growthGoals, addGrowthGoal, toggleGrowthGoal } = useApp();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("Academic");
  const today = new Date();
  const affirmation = AFFIRMATIONS[today.getDate() % AFFIRMATIONS.length];
  const quote = MOTIVATIONAL_QUOTES[(today.getDate() + 2) % MOTIVATIONAL_QUOTES.length];
  const completed = growthGoals.filter((g) => g.completed).length;
  const categories = ["Academic", "Health", "Career", "Personal", "Financial"];

  const handleAdd = async () => {
    if (!goalTitle.trim()) return;
    await addGrowthGoal({ title: goalTitle, category: goalCategory });
    setGoalTitle("");
    setShowAddGoal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.highlight, "#FF6F00"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Personal Growth Hub</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Build habits and grow beyond the classroom</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}>
        <LinearGradient colors={[colors.primary + "18", colors.accent + "18"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.affirmCard, { borderRadius: colors.radius * 1.5, borderColor: colors.primary + "30", borderWidth: 1 }]}>
          <View style={styles.affirmHeader}>
            <Feather name="sun" size={18} color={colors.highlight} />
            <Text style={[styles.affirmLabel, { color: colors.highlight, fontFamily: "Inter_600SemiBold" }]}>Today's Affirmation</Text>
          </View>
          <Text style={[styles.affirmText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>"{affirmation}"</Text>
        </LinearGradient>

        <Card>
          <View style={styles.quoteHeader}>
            <Feather name="zap" size={16} color={colors.primary} />
            <Text style={[styles.quoteLabel, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Daily Motivation</Text>
          </View>
          <Text style={[styles.quoteText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>"{quote.quote}"</Text>
          <Text style={[styles.quoteAuthor, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>— {quote.author}</Text>
        </Card>

        <View>
          <View style={styles.goalHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>My Goals ({growthGoals.length})</Text>
            <Button onPress={() => setShowAddGoal(true)} title="Add Goal" size="sm" />
          </View>
          {growthGoals.length > 0 && (
            <View style={[styles.progressSummary, { backgroundColor: colors.muted, borderRadius: colors.radius, marginBottom: 12 }]}>
              <Text style={[styles.progressLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{completed} of {growthGoals.length} goals completed</Text>
              <ProgressBar progress={growthGoals.length ? completed / growthGoals.length : 0} height={6} color={colors.accent} style={{ marginTop: 8 }} />
            </View>
          )}
          {growthGoals.length === 0 ? (
            <EmptyState icon="star" title="No goals yet" subtitle="Set personal growth goals to track your journey beyond academics" />
          ) : (
            <View style={{ gap: 8 }}>
              {growthGoals.map((goal) => (
                <Pressable key={goal.id} onPress={() => { toggleGrowthGoal(goal.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={[styles.checkCircle, { borderColor: goal.completed ? colors.accent : colors.border, backgroundColor: goal.completed ? colors.accent : "transparent" }]}>
                      {goal.completed && <Feather name="check" size={14} color="#fff" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.goalTitle, { color: goal.completed ? colors.mutedForeground : colors.foreground, fontFamily: "Inter_500Medium", textDecorationLine: goal.completed ? "line-through" : "none" }]}>{goal.title}</Text>
                      <Text style={[styles.goalDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Added {new Date(goal.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Badge label={goal.category} variant={goal.completed ? "accent" : "muted"} size="sm" />
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>Recommended Habits</Text>
          {HABIT_SUGGESTIONS.map((habit) => (
            <Card key={habit.title} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <View style={[styles.habitIcon, { backgroundColor: colors.highlight + "18" }]}>
                <Feather name={habit.icon} size={20} color={colors.highlight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.habitTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{habit.title}</Text>
                <Text style={[styles.habitDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{habit.desc}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showAddGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>New Goal</Text>
              <Pressable onPress={() => setShowAddGoal(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Goal Description</Text>
                <TextInput value={goalTitle} onChangeText={setGoalTitle} placeholder="e.g. Read one book per month" placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Category</Text>
                <View style={styles.catRow}>
                  {categories.map((cat) => (
                    <Pressable key={cat} onPress={() => setGoalCategory(cat)} style={[styles.catChip, { backgroundColor: goalCategory === cat ? colors.primary : colors.muted, borderRadius: 999 }]}>
                      <Text style={[styles.catText, { color: goalCategory === cat ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }]}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Button onPress={handleAdd} title="Add Goal" fullWidth />
            </View>
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
  affirmCard: { padding: 16, gap: 10 },
  affirmHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  affirmLabel: { fontSize: 13 },
  affirmText: { fontSize: 17, lineHeight: 25 },
  quoteHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  quoteLabel: { fontSize: 14 },
  quoteText: { fontSize: 14, lineHeight: 21, fontStyle: "italic" },
  quoteAuthor: { fontSize: 12, marginTop: 8 },
  goalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17 },
  progressSummary: { padding: 14 },
  progressLabel: { fontSize: 13 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  goalTitle: { fontSize: 14 },
  goalDate: { fontSize: 11, marginTop: 3 },
  habitIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  habitTitle: { fontSize: 14 },
  habitDesc: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  fieldLabel: { fontSize: 13 },
  textField: { height: 50, paddingHorizontal: 14, fontSize: 15 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7 },
  catText: { fontSize: 12 },
});
