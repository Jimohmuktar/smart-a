import React, { useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetch as expoFetch } from "expo/fetch";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";

const SYSTEM_PROMPT = `You are Smart-A, an AI academic assistant built specifically for Nigerian university students. 
You help with: study strategies, academic advice, subject explanations, career guidance, and personal development.
Be friendly, encouraging, and culturally aware of Nigerian higher education. Keep responses clear and practical.
You can help with subjects like Mathematics, Engineering, Sciences, Law, Medicine, Business, and more.
Always motivate students to excel academically. You speak in a supportive, mentor-like tone.`;

const SUGGESTIONS = [
  "How do I improve my GPA this semester?",
  "Explain the concept of supply and demand simply",
  "Tips for writing a good research paper",
  "What careers can I pursue with a Computer Science degree in Nigeria?",
  "How do I manage exam stress?",
];

export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);
  const API_BASE = `${import.meta.env.VITE_API_URL || 'https://api-server-qlw3.onrender.com'}`;

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await expoFetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!res.ok) throw new Error("AI service unavailable");
      const data = await res.json();
      const assistantMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: data.content || "I'm here to help!" };
      setMessages([...newMessages, assistantMsg]);
    } catch (err) {
      const errMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting right now. Please check your connection and try again." };
      setMessages([...newMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.msgRow, { flexDirection: item.role === "user" ? "row-reverse" : "row" }]}>
      {item.role === "assistant" && (
        <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
          <Feather name="cpu" size={16} color="#fff" />
        </View>
      )}
      {item.role === "user" && <Avatar name={user?.fullName || "U"} size={34} />}
      <View style={[styles.bubble, { backgroundColor: item.role === "user" ? colors.primary : colors.card, borderColor: colors.border, maxWidth: "75%" }]}>
        <Text style={[styles.bubbleText, { color: item.role === "user" ? "#fff" : colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <View style={[styles.botInfo, { flex: 1 }]}>
          <View style={[styles.botDot, { backgroundColor: colors.accent }]} />
          <View>
            <Text style={[styles.botName, { fontFamily: "Inter_700Bold" }]}>Smart-A AI Tutor</Text>
            <Text style={[styles.botSub, { fontFamily: "Inter_400Regular" }]}>Powered by Gemini AI • Always available</Text>
          </View>
        </View>
        <Pressable onPress={() => setMessages([])} style={[styles.clearBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="refresh-cw" size={16} color="#fff" />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 6, gap: 2, paddingBottom: 3 }}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="cpu" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Smart-A AI Tutor</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Your personal academic assistant for Nigerian university students. Ask me anything!
              </Text>
              <View style={{ gap: 1, width: "100%" }}> 
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s} onPress={() => sendMessage(s)} style={[styles.suggBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                    <Text style={[styles.suggText, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>{s}</Text>
                    <Feather name="arrow-right" size={14} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={loading ? (
            <View style={[styles.msgRow, { flexDirection: "row" }]}>
              <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}><Feather name="cpu" size={16} color="#fff" /></View>
              <View style={[styles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            </View>
          ) : null}
        />

        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Smart-A anything..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.chatInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: 24, fontFamily: "Inter_400Regular" }]}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <Pressable onPress={() => sendMessage()} disabled={!input.trim() || loading} style={[styles.sendBtn, { backgroundColor: input.trim() && !loading ? colors.primary : colors.muted }]}>
            <Feather name="send" size={18} color={input.trim() && !loading ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  botInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  botDot: { width: 10, height: 10, borderRadius: 5 },
  botName: { color: "#fff", fontSize: 16 },
  botSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  clearBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  botAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  bubble: { padding: 12, borderRadius: 16, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyContainer: { paddingTop: 40, alignItems: "center", gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  suggBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderWidth: 1 },
  suggText: { flex: 1, fontSize: 14, lineHeight: 19 },
});
