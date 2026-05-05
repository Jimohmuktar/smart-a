import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = ["Study", "Assignment", "Exam Prep", "Personal", "Meeting", "Project"];
const PRIORITIES = ["High", "Medium", "Low"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PlannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", description: "", category: "Study", priority: "Medium", dueDate: "" });

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  const todayStr = today.toDateString();
  const filterOptions = ["All", "Today", "Pending", "Completed"];
  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Today") return new Date(t.dueDate || "").toDateString() === todayStr;
    if (filter === "Pending") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const completed = tasks.filter((t) => t.completed).length;
  const completion = tasks.length ? completed / tasks.length : 0;

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await addTask(form);
    setForm({ title: "", description: "", category: "Study", priority: "Medium", dueDate: "" });
    setShowModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.weekHeader, { backgroundColor: colors.primary }]}>
          <Text style={[styles.monthLabel, { fontFamily: "Inter_600SemiBold" }]}>{today.toLocaleString("default", { month: "long", year: "numeric" })}</Text>
          <View style={styles.weekRow}>
            {weekDays.map((d, i) => {
              const isToday = d.toDateString() === todayStr;
              const dayTasks = tasks.filter((t) => new Date(t.dueDate || "").toDateString() === d.toDateString());
              return (
                <View key={i} style={[styles.dayBox, { backgroundColor: isToday ? "rgba(255,255,255,0.25)" : "transparent", borderRadius: 12 }]}>
                  <Text style={[styles.dayName, { fontFamily: "Inter_400Regular", color: isToday ? "#fff" : "rgba(255,255,255,0.7)" }]}>{DAYS[d.getDay()]}</Text>
                  <Text style={[styles.dayNum, { fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular", color: "#fff" }]}>{d.getDate()}</Text>
                  {dayTasks.length > 0 && <View style={[styles.taskDot, { backgroundColor: "#fff" }]} />}
                </View>
              );
            })}
          </View>
          <View style={[styles.progressBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={[styles.progressText, { fontFamily: "Inter_500Medium" }]}>{completed}/{tasks.length} tasks completed</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completion * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          {filterOptions.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterTab, { borderBottomColor: filter === f ? colors.primary : "transparent", borderBottomWidth: 2 }]}>
              <Text style={[styles.filterText, { color: filter === f ? colors.primary : colors.mutedForeground, fontFamily: filter === f ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{f}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          {filtered.length === 0 ? (
            <EmptyState icon="calendar" title="No tasks here" subtitle="Add tasks to organize your academic schedule effectively" />
          ) : (
            filtered.map((task) => (
              <Card key={task.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Pressable onPress={() => toggleTask(task.id)} style={[styles.checkBtn, { borderColor: task.completed ? colors.accent : colors.border, backgroundColor: task.completed ? colors.accent : "transparent" }]}>
                  {task.completed && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, { color: task.completed ? colors.mutedForeground : colors.foreground, fontFamily: "Inter_500Medium", textDecorationLine: task.completed ? "line-through" : "none" }]}>{task.title}</Text>
                  {task.description ? <Text style={[styles.taskDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{task.description}</Text> : null}
                  <View style={styles.taskMeta}>
                    <Badge label={task.category} variant="muted" size="sm" />
                    {task.dueDate ? (
                      <View style={styles.dueDateRow}>
                        <Feather name="calendar" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.dueDateText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{new Date(task.dueDate).toLocaleDateString()}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={{ gap: 6, alignItems: "flex-end" }}>
                  <Badge label={task.priority} variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "warning" : "accent"} size="sm" />
                  <Pressable onPress={() => deleteTask(task.id)}>
                    <Feather name="trash-2" size={15} color={colors.destructive + "80"} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <Pressable onPress={() => setShowModal(true)} style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius * 2 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Add Task</Text>
              <Pressable onPress={() => setShowModal(false)}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
            </View>
            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Task Title *</Text>
                <TextInput value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="What needs to be done?" placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Description</Text>
                <TextInput value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional details..." placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular", minHeight: 60, textAlignVertical: "top" }]} multiline />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Due Date (YYYY-MM-DD)</Text>
                <TextInput value={form.dueDate} onChangeText={(v) => setForm((f) => ({ ...f, dueDate: v }))} placeholder={today.toISOString().split("T")[0]} placeholderTextColor={colors.mutedForeground} style={[styles.textField, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, fontFamily: "Inter_400Regular" }]} />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {CATEGORIES.map((c) => (
                      <Pressable key={c} onPress={() => setForm((f) => ({ ...f, category: c }))} style={[styles.chipBtn, { backgroundColor: form.category === c ? colors.primary : colors.muted, borderRadius: 999 }]}>
                        <Text style={[styles.chipText, { color: form.category === c ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Priority</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PRIORITIES.map((p) => {
                    const pc = p === "High" ? colors.destructive : p === "Medium" ? colors.highlight : colors.accent;
                    return (
                      <Pressable key={p} onPress={() => setForm((f) => ({ ...f, priority: p }))} style={[styles.priorityBtn, { backgroundColor: form.priority === p ? pc + "25" : colors.muted, borderColor: form.priority === p ? pc : "transparent", borderWidth: 1.5, borderRadius: colors.radius, flex: 1 }]}>
                        <Text style={[styles.priorityText, { color: form.priority === p ? pc : colors.foreground, fontFamily: "Inter_500Medium" }]}>{p}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <Button onPress={handleAdd} title="Add Task" fullWidth />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  weekHeader: { padding: 16, paddingTop: 12 },
  monthLabel: { color: "rgba(255,255,255,0.9)", fontSize: 15, marginBottom: 12 },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayBox: { alignItems: "center", padding: 6, width: 42 },
  dayName: { fontSize: 11 },
  dayNum: { fontSize: 18, marginTop: 2 },
  taskDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 3 },
  progressBox: { marginTop: 14, borderRadius: 10, padding: 12 },
  progressText: { color: "#fff", fontSize: 13, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 3 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  filterTab: { paddingHorizontal: 14, paddingVertical: 12 },
  filterText: { fontSize: 13 },
  checkBtn: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  taskTitle: { fontSize: 15 },
  taskDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  dueDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueDateText: { fontSize: 11 },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20 },
  fieldLabel: { fontSize: 13 },
  textField: { height: 46, paddingHorizontal: 14, fontSize: 15 },
  chipBtn: { paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13 },
  priorityBtn: { height: 42, alignItems: "center", justifyContent: "center" },
  priorityText: { fontSize: 14 },
});
