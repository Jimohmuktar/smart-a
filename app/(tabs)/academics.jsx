import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const GRADES = ["A", "B", "C", "D", "E", "F"];
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
const GRADE_COLORS = { A: "#2E7D32", B: "#1565C0", C: "#FF8F00", D: "#E65100", E: "#C62828", F: "#B71C1C" };

export default function AcademicsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courses, addCourse, updateCourse, deleteCourse, calculateGPA } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", units: "3", grade: "B", semester: "1st Semester" });
  const [activeTab, setActiveTab] = useState("All");

  const semesters = ["All", "1st Semester", "2nd Semester"];
  const gpa = calculateGPA();
  const gpaClass = gpa >= 4.5 ? "First Class" : gpa >= 3.5 ? "Second Class Upper" : gpa >= 2.5 ? "Second Class Lower" : gpa >= 1.5 ? "Third Class" : gpa > 0 ? "Pass" : "N/A";
  const filtered = activeTab === "All" ? courses : courses.filter((c) => c.semester === activeTab);

  const openAdd = () => { setEditCourse(null); setForm({ name: "", code: "", units: "3", grade: "B", semester: "1st Semester" }); setShowModal(true); };
  const openEdit = (c) => { setEditCourse(c); setForm({ name: c.name, code: c.code, units: String(c.units), grade: c.grade, semester: c.semester }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    const data = { name: form.name, code: form.code, units: parseInt(form.units) || 3, grade: form.grade, semester: form.semester };
    if (editCourse) await updateCourse(editCourse.id, data);
    else await addCourse(data);
    setShowModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.gpaHeader, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpaTitle, { fontFamily: "Inter_500Medium" }]}>Cumulative GPA</Text>
            <Text style={[styles.gpaValue, { fontFamily: "Inter_700Bold" }]}>{gpa.toFixed(2)}<Text style={styles.gpaDenom}> / 5.00</Text></Text>
            <Text style={[styles.gpaClass, { fontFamily: "Inter_600SemiBold" }]}>{gpaClass}</Text>
          </View>
          <View style={styles.gpaCircle}>
            <Text style={[styles.gpaPercent, { fontFamily: "Inter_700Bold" }]}>{Math.round(gpa / 5 * 100)}%</Text>
            <Text style={[styles.gpaPercentLabel, { fontFamily: "Inter_400Regular" }]}>Score</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: -1, backgroundColor: colors.primary, paddingBottom: 20 }}>
          <ProgressBar progress={gpa / 5} height={8} color="rgba(255,255,255,0.9)" />
          <View style={styles.gpaLegend}>
            {[{ label: "1.0 Pass" }, { label: "2.5 2:2" }, { label: "3.5 2:1" }, { label: "4.5 1st" }].map((l) => (
              <Text key={l.label} style={[styles.legendText, { fontFamily: "Inter_400Regular" }]}>{l.label}</Text>
            ))}
          </View>
        </View>

        <View style={styles.tabsRow}>
          {semesters.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, { borderBottomColor: activeTab === tab ? colors.primary : "transparent", borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground, fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          {filtered.length === 0 ? (
            <EmptyState icon="book-open" title="No courses yet" subtitle="Add your courses to start tracking your academic performance" />
          ) : (
            filtered.map((course) => (
              <Card key={course.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={[styles.gradeBox, { backgroundColor: (GRADE_COLORS[course.grade] || colors.muted) + "20" }]}>
                  <Text style={[styles.gradeText, { color: GRADE_COLORS[course.grade] || colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>{course.grade}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.courseName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{course.name}</Text>
                  <Text style={[styles.courseCode, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{course.code} • {course.units} units • {course.semester}</Text>
                  <Text style={[styles.gpPoint, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{GRADE_POINTS[course.grade] || 0} grade points</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable onPress={() => openEdit(course)} style={[styles.iconBtn, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name="edit-2" size={15} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => deleteCourse(course.id)} style={[styles.iconBtn, { backgroundColor: colors.destructive + "15" }]}>
                    <Feather name="trash-2" size={15} color={colors.destructive} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <Pressable onPress={openAdd} style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{editCourse ? "Edit Course" : "Add Course"}</Text>
              <Pressable onPress={() => setShowModal(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Course Name</Text>
                <TextInput value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Introduction to Programming" placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} />
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Course Code</Text>
                  <TextInput value={form.code} onChangeText={(v) => setForm((f) => ({ ...f, code: v }))} placeholder="e.g. CSC101" placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} autoCapitalize="characters" />
                </View>
                <View style={{ width: 80, gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Units</Text>
                  <TextInput value={form.units} onChangeText={(v) => setForm((f) => ({ ...f, units: v }))} keyboardType="number-pad" placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular", textAlign: "center" }]} />
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Grade</Text>
                <View style={styles.gradeRow}>
                  {GRADES.map((g) => (
                    <Pressable key={g} onPress={() => setForm((f) => ({ ...f, grade: g }))} style={[styles.gradeOption, { backgroundColor: form.grade === g ? GRADE_COLORS[g] : colors.muted, borderRadius: 8 }]}>
                      <Text style={[styles.gradeOptionText, { color: form.grade === g ? "#fff" : colors.foreground, fontFamily: "Inter_700Bold" }]}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Semester</Text>
                <View style={styles.row2}>
                  {["1st Semester", "2nd Semester"].map((s) => (
                    <Pressable key={s} onPress={() => setForm((f) => ({ ...f, semester: s }))} style={[styles.semBtn, { flex: 1, backgroundColor: form.semester === s ? colors.primary : colors.muted, borderRadius: colors.radius }]}>
                      <Text style={[styles.semText, { color: form.semester === s ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Button onPress={handleSave} title={editCourse ? "Save Changes" : "Add Course"} fullWidth />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  gpaHeader: { padding: 20, paddingTop: 16, flexDirection: "row", alignItems: "center" },
  gpaTitle: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  gpaValue: { color: "#fff", fontSize: 36, marginTop: 4 },
  gpaDenom: { fontSize: 18 },
  gpaClass: { color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 4 },
  gpaCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  gpaPercent: { color: "#fff", fontSize: 20 },
  gpaPercentLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  gpaLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  legendText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  tabsRow: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  tabText: { fontSize: 14 },
  gradeBox: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gradeText: { fontSize: 22 },
  courseName: { fontSize: 15 },
  courseCode: { fontSize: 12, marginTop: 2 },
  gpPoint: { fontSize: 12, marginTop: 4 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  fieldLabel: { fontSize: 13 },
  textField: { height: 46, paddingHorizontal: 14, fontSize: 15 },
  row2: { flexDirection: "row", gap: 10 },
  gradeRow: { flexDirection: "row", gap: 8 },
  gradeOption: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
  gradeOptionText: { fontSize: 16 },
  semBtn: { height: 42, alignItems: "center", justifyContent: "center" },
  semText: { fontSize: 13 },
});
