import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QUIZ_CATEGORIES, QUIZ_QUESTIONS } from "@/utils/quiz-data";

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addQuizScore, quizScores } = useApp();
  const [phase, setPhase] = useState("select");
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startQuiz = (cat) => {
    const qs = QUIZ_QUESTIONS.filter((q) => q.category === cat).slice(0, 10);
    setCategory(cat);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setTimeLeft(20);
    setAnswers([]);
    setPhase("quiz");
  };

  useEffect(() => {
    if (phase !== "quiz") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleNext(null); return 20; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, phase]);

  const handleAnswer = (opt) => {
    if (selected) return;
    clearInterval(timerRef.current);
    setSelected(opt);
    const correct = opt === questions[current].answer;
    if (correct) { setScore((s) => s + 1); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setAnswers((a) => [...a, { question: questions[current].question, selected: opt, correct, correctAnswer: questions[current].answer }]);
  };

  const handleNext = (opt) => {
    if (!selected && opt !== null) { setAnswers((a) => [...a, { question: questions[current].question, selected: "Skipped", correct: false, correctAnswer: questions[current].answer }]); }
    clearInterval(timerRef.current);
    Animated.sequence([Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }), Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true })]).start();
    if (current + 1 >= questions.length) {
      addQuizScore({ category, score, total: questions.length });
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setTimeLeft(20);
    }
  };

  const bestScore = quizScores.filter((s) => s.category === category).reduce((best, s) => Math.max(best, s.score), 0);

  if (phase === "select") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Brain Teaser Quiz</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Test your knowledge across subjects</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 40 }}>
          {QUIZ_CATEGORIES.map((cat) => {
            const best = quizScores.filter((s) => s.category === cat).reduce((b, s) => Math.max(b, s.score), 0);
            const count = QUIZ_QUESTIONS.filter((q) => q.category === cat).length;
            return (
              <Pressable key={cat} onPress={() => startQuiz(cat)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <Card style={styles.catCard}>
                  <View style={[styles.catIcon, { backgroundColor: colors.primary + "15" }]}><Feather name="help-circle" size={22} color={colors.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.catName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{cat}</Text>
                    <Text style={[styles.catSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{count} questions • 20s per question</Text>
                    {best > 0 && <Text style={[styles.bestScore, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>Best: {best}/{count}</Text>}
                  </View>
                  <Badge label={best > 0 ? "Played" : "New"} variant={best > 0 ? "accent" : "muted"} size="sm" />
                </Card>
              </Pressable>
            );
          })}
          {quizScores.length > 0 && (
            <Card style={{ marginTop: 8 }}>
              <Text style={[styles.histTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>Recent Scores</Text>
              {quizScores.slice(-5).reverse().map((s) => (
                <View key={s.id} style={[styles.histRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.histCat, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{s.category}</Text>
                  <Text style={[styles.histScore, { color: s.score / s.total >= 0.7 ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>{s.score}/{s.total}</Text>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </View>
    );
  }

  if (phase === "quiz" && questions.length > 0) {
    const q = questions[current];
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.quizHeader, { backgroundColor: colors.primary, paddingTop: 16 }]}>
          <View style={styles.quizTopRow}>
            <Text style={[styles.quizProgress, { fontFamily: "Inter_600SemiBold" }]}>{current + 1} / {questions.length}</Text>
            <View style={[styles.timerBox, { backgroundColor: timeLeft <= 5 ? colors.destructive + "40" : "rgba(255,255,255,0.2)" }]}>
              <Feather name="clock" size={14} color="#fff" />
              <Text style={[styles.timerText, { fontFamily: "Inter_700Bold" }]}>{timeLeft}s</Text>
            </View>
            <Text style={[styles.quizScore, { fontFamily: "Inter_600SemiBold" }]}>Score: {score}</Text>
          </View>
          <View style={styles.quizProgBar}>
            <View style={[styles.quizProgFill, { width: `${(current / questions.length) * 100}%` }]} />
          </View>
        </View>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 40 }}>
            <View style={styles.diffRow}>
              <Badge label={category} variant="primary" size="sm" />
              <Badge label={q.difficulty} variant={q.difficulty === "Hard" ? "destructive" : q.difficulty === "Medium" ? "warning" : "accent"} size="sm" />
            </View>
            <Card elevated style={{ padding: 20 }}>
              <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{q.question}</Text>
            </Card>
            <View style={{ gap: 10 }}>
              {q.options.map((opt) => {
                let bg = colors.card, border = colors.border, textColor = colors.foreground;
                if (selected) {
                  if (opt === q.answer) { bg = colors.success + "20"; border = colors.success; textColor = colors.success; }
                  else if (opt === selected && opt !== q.answer) { bg = colors.destructive + "20"; border = colors.destructive; textColor = colors.destructive; }
                }
                return (
                  <Pressable key={opt} onPress={() => handleAnswer(opt)} style={[styles.optionBtn, { backgroundColor: bg, borderColor: border, borderRadius: colors.radius }]}>
                    <Text style={[styles.optionText, { color: textColor, fontFamily: selected && opt === q.answer ? "Inter_700Bold" : "Inter_400Regular" }]}>{opt}</Text>
                    {selected && opt === q.answer && <Feather name="check-circle" size={18} color={colors.success} />}
                    {selected && opt === selected && opt !== q.answer && <Feather name="x-circle" size={18} color={colors.destructive} />}
                  </Pressable>
                );
              })}
            </View>
            {selected && (
              <Button onPress={() => handleNext(selected)} title={current + 1 >= questions.length ? "See Results" : "Next Question"} fullWidth />
            )}
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.resultHeader, { backgroundColor: score / questions.length >= 0.7 ? colors.success : score / questions.length >= 0.4 ? colors.highlight : colors.destructive }]}>
        <Feather name={score / questions.length >= 0.7 ? "award" : score / questions.length >= 0.4 ? "thumbs-up" : "refresh-cw"} size={48} color="#fff" />
        <Text style={[styles.resultTitle, { fontFamily: "Inter_700Bold" }]}>{score / questions.length >= 0.7 ? "Excellent!" : score / questions.length >= 0.4 ? "Good Try!" : "Keep Practicing!"}</Text>
        <Text style={[styles.resultScore, { fontFamily: "Inter_700Bold" }]}>{score} / {questions.length}</Text>
        <Text style={[styles.resultPct, { fontFamily: "Inter_500Medium" }]}>{Math.round(score / questions.length * 100)}% Correct</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 40 }}>
        {answers.map((a, i) => (
          <Card key={i} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <View style={[styles.resultDot, { backgroundColor: a.correct ? colors.success : colors.destructive }]}>
              <Feather name={a.correct ? "check" : "x"} size={12} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.answerQ, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{a.question}</Text>
              {!a.correct && <Text style={[styles.correctAns, { color: colors.success, fontFamily: "Inter_400Regular" }]}>Correct: {a.correctAnswer}</Text>}
            </View>
          </Card>
        ))}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button onPress={() => startQuiz(category)} title="Retry Quiz" variant="outline" style={{ flex: 1 }} />
          <Button onPress={() => setPhase("select")} title="Choose Category" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  catCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  catIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  catName: { fontSize: 16 },
  catSub: { fontSize: 12, marginTop: 2 },
  bestScore: { fontSize: 12, marginTop: 4 },
  histTitle: { fontSize: 16 },
  histRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1 },
  histCat: { fontSize: 14 },
  histScore: { fontSize: 14 },
  quizHeader: { padding: 16 },
  quizTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quizProgress: { color: "#fff", fontSize: 15 },
  timerBox: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  timerText: { color: "#fff", fontSize: 14 },
  quizScore: { color: "#fff", fontSize: 15 },
  quizProgBar: { height: 4, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, marginTop: 12, overflow: "hidden" },
  quizProgFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  diffRow: { flexDirection: "row", gap: 8 },
  questionText: { fontSize: 18, lineHeight: 26 },
  optionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderWidth: 1.5 },
  optionText: { fontSize: 15, flex: 1 },
  resultHeader: { padding: 40, alignItems: "center", gap: 12 },
  resultTitle: { color: "#fff", fontSize: 28 },
  resultScore: { color: "#fff", fontSize: 48 },
  resultPct: { color: "rgba(255,255,255,0.9)", fontSize: 18 },
  resultDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  answerQ: { fontSize: 14, lineHeight: 19 },
  correctAns: { fontSize: 12, marginTop: 4 },
});
