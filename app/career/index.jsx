import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CAREERS } from "@/utils/quiz-data";

const NIGERIANMARKET = [
  { sector: "Technology", growth: "+35%", companies: ["Paystack", "Flutterwave", "Andela", "Interswitch", "Konga"] },
  { sector: "Finance", growth: "+22%", companies: ["GTBank", "Zenith Bank", "Access Bank", "KPMG", "PwC"] },
  { sector: "Oil & Gas", growth: "+18%", companies: ["Shell", "Chevron", "NNPC", "Total Energies", "ExxonMobil"] },
  { sector: "Healthcare", growth: "+28%", companies: ["54gene", "LifeBank", "mDoc", "Healthtracka", "NHS"] },
];

export default function CareerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Feather name="arrow-left" size={22} color="#fff" /></Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Career Path Insights</Text>
        <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Discover your future in Nigeria's growing economy</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Career Paths by Degree</Text>
        {CAREERS.map((c) => (
          <Pressable key={c.degree} onPress={() => setSelected(selected?.degree === c.degree ? null : c)}>
            <Card style={{ gap: 12 }}>
              <View style={styles.degreeHeader}>
                <View style={[styles.degreeIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="book" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.degreeName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{c.degree}</Text>
                  <Text style={[styles.degreeSalary, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>{c.avgSalary}</Text>
                </View>
                <Feather name={selected?.degree === c.degree ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
              </View>
              {selected?.degree === c.degree && (
                <View style={{ gap: 8 }}>
                  <Text style={[styles.pathTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Career Options:</Text>
                  <View style={styles.pathGrid}>
                    {c.paths.map((path) => (
                      <View key={path} style={[styles.pathChip, { backgroundColor: colors.primary + "15", borderRadius: colors.radius }]}>
                        <Feather name="briefcase" size={12} color={colors.primary} />
                        <Text style={[styles.pathText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{path}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Nigerian Job Market Trends</Text>
        {NIGERIANMARKET.map((sector) => (
          <Card key={sector.sector}>
            <View style={styles.sectorHeader}>
              <Text style={[styles.sectorName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{sector.sector}</Text>
              <Badge label={`Growth ${sector.growth}`} variant="accent" size="sm" />
            </View>
            <Text style={[styles.companiesLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 10, marginBottom: 6 }]}>Top Employers:</Text>
            <View style={styles.companyRow}>
              {sector.companies.map((co) => (
                <View key={co} style={[styles.companyChip, { backgroundColor: colors.muted, borderRadius: 999 }]}>
                  <Text style={[styles.companyText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{co}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Card style={{ backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }}>
          <View style={styles.tipsHeader}>
            <Feather name="zap" size={18} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Pro Tips for Nigerian Graduates</Text>
          </View>
          {[
            "Build a strong LinkedIn profile to attract recruiters",
            "Attend campus career fairs and networking events",
            "Get NYSC placement in your desired sector strategically",
            "Learn digital skills alongside your degree — tech pays",
            "Build a portfolio or side project while in school",
            "Connect with alumni from your school already in industry",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipNum, { backgroundColor: colors.primary }]}>
                <Text style={[styles.tipNumText, { fontFamily: "Inter_700Bold" }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.tipText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{tip}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 17 },
  degreeHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  degreeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  degreeName: { fontSize: 16 },
  degreeSalary: { fontSize: 12, marginTop: 2 },
  pathTitle: { fontSize: 13 },
  pathGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pathChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  pathText: { fontSize: 12 },
  sectorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectorName: { fontSize: 16 },
  companiesLabel: { fontSize: 13 },
  companyRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  companyChip: { paddingHorizontal: 10, paddingVertical: 5 },
  companyText: { fontSize: 12 },
  tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  tipsTitle: { fontSize: 16 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tipNumText: { color: "#fff", fontSize: 11 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
