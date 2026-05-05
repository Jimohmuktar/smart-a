import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SKILLS_DATA } from "@/utils/quiz-data";

const SKILL_CATEGORIES = ["All", "Technology", "Business", "Creative", "Finance", "Soft Skills"];
const CATEGORY_COLORS = { Technology: "#1565C0", Business: "#E65100", Creative: "#7B1FA2", Finance: "#2E7D32", "Soft Skills": "#00897B" };

export default function SkillsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { enrolledSkills, enrollSkill } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? SKILLS_DATA : SKILLS_DATA.filter((s) => s.category === activeCategory);

  const handleEnroll = async (id) => {
    await enrollSkill(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Skills Marketplace</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Acquire in-demand skills for the modern workplace</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.statText, { fontFamily: "Inter_600SemiBold" }]}>{SKILLS_DATA.length} Skills</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.statText, { fontFamily: "Inter_600SemiBold" }]}>{enrolledSkills.length} Enrolled</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
        {SKILL_CATEGORIES.map((cat) => (
          <Pressable key={cat} onPress={() => setActiveCategory(cat)} style={[styles.catChip, { backgroundColor: activeCategory === cat ? colors.primary : colors.muted, borderRadius: 999 }]}>
            <Text style={[styles.catText, { color: activeCategory === cat ? "#fff" : colors.foreground, fontFamily: activeCategory === cat ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}>
        {filtered.map((skill) => {
          const enrolled = enrolledSkills.includes(skill.id);
          const catColor = CATEGORY_COLORS[skill.category] || colors.primary;
          return (
            <Card key={skill.id} style={styles.skillCard}>
              <View style={[styles.skillIcon, { backgroundColor: catColor + "18" }]}>
                <Feather name={skill.icon} size={24} color={catColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.skillName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{skill.name}</Text>
                <Text style={[styles.skillDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{skill.description}</Text>
                <View style={styles.skillMeta}>
                  <Badge label={skill.category} variant="muted" size="sm" />
                  <View style={styles.durationRow}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.duration, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{skill.duration}</Text>
                  </View>
                  <Badge label={skill.level} variant="primary" size="sm" />
                </View>
              </View>
              <Pressable onPress={() => !enrolled && handleEnroll(skill.id)} style={[styles.enrollBtn, { backgroundColor: enrolled ? colors.success + "20" : colors.primary, borderRadius: colors.radius }]}>
                <Feather name={enrolled ? "check" : "plus"} size={16} color={enrolled ? colors.success : "#fff"} />
                <Text style={[styles.enrollText, { color: enrolled ? colors.success : "#fff", fontFamily: "Inter_600SemiBold" }]}>{enrolled ? "Enrolled" : "Enroll"}</Text>
              </Pressable>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  statText: { color: "#fff", fontSize: 13 },
  catScroll: { borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  catChip: { paddingHorizontal: 16, paddingVertical: 8 },
  catText: { fontSize: 13 },
  skillCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  skillIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  skillName: { fontSize: 15 },
  skillDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  skillMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  duration: { fontSize: 11 },
  enrollBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  enrollText: { fontSize: 12 },
});
