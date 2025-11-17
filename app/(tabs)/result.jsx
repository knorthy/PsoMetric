// app/(tabs)/result.jsx
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Circle, G, Svg } from "react-native-svg";
import { hp, wp } from "../../helpers/common"; // CORRECT PATH
import { Sidebar } from "../history&theme/history";
import { ColorSchemeModal } from "../history&theme/theme";

const PLACEHOLDER_AVATAR = "https://www.hindustantimes.com/ht-img/img/2023/07/15/1600x900/jennie_1689410686831_1689410687014.jpg";
// REALISTIC PSORIASIS PLACEHOLDERS
const PSORIASIS_IMAGES = [
  "https://images.unsplash.com/photo-1623428187422-7c8d7d8d7d8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1623428187422-7c8d7d8d7d8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1623428187422-7c8d7d8d7d8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1623428187422-7c8d7d8d7d8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
];

export const ASSESSMENT_FORM = {
  patientName: "Emma Johnson",
  age: 34,
  gender: "Female",
  psoriasisHistory: "first",
  uploadedImages: PSORIASIS_IMAGES,
};

const PASI_DATA = {
  total: 12.4,
  severity: "Moderate",
  regions: [
    { name: "Head", area: 10, erythema: 2, induration: 2, scaling: 2, score: 1.2 },
    { name: "Upper Limbs", area: 20, erythema: 2, induration: 2, scaling: 2, score: 4.8 },
    { name: "Trunk", area: 30, erythema: 1, induration: 1, scaling: 1, score: 2.7 },
    { name: "Lower Limbs", area: 40, erythema: 1, induration: 1, scaling: 1, score: 3.7 },
  ],
};

const getRecommendations = (score) => {
  if (score < 7) return "Continue current topical therapy. Monitor monthly.";
  if (score < 12) return "Consider adding calcipotriene or increasing topical potency.";
  if (score < 20) return "Initiate narrowband UVB phototherapy 2–3x/week. Add emollients.";
  return "Refer to dermatology for biologic therapy (e.g., adalimumab, secukinumab).";
};

const ProgressRing = ({ score, size = 140, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 72) * circumference;
  const color = score < 10 ? "#10B981" : score < 20 ? "#F59E0B" : "#EF4444";

  return (
    <View style={{ width: size, height: size, marginVertical: hp(2.5) }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringScore, { color }]}>{score.toFixed(1)}</Text>
        <Text style={styles.ringLabel}>PASI Score</Text>
      </View>
    </View>
  );
};

export default function Result() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);

  if (!fontsLoaded) return null;

  const getSeverityColor = () => PASI_DATA.total < 10 ? "#10B981" : PASI_DATA.total < 20 ? "#F59E0B" : "#EF4444";

  const saveToFiles = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Report saved to Files.");
  };

  const sharePDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Shared", "Report shared.");
  };

  const pieData = PASI_DATA.regions.map((r, i) => ({
    name: r.name,
    score: r.score,
    color: ["#1A73E8", "#34A853", "#FBBC04", "#EA4335"][i],
    legendFontColor: "#555",
    legendFontSize: wp(3),
  }));

  // Split into rows of 2
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const imageRows = chunkArray(ASSESSMENT_FORM.uploadedImages, 2);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconButton}>
          <MaterialIcons name="menu" size={wp(6.5)} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={{ uri: PLACEHOLDER_AVATAR }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>PASI Assessment</Text>

        <View style={styles.ringWrapper}>
          <ProgressRing score={PASI_DATA.total} />
          <Text style={[styles.severityText, { color: getSeverityColor() }]}>{PASI_DATA.severity} Psoriasis</Text>
        </View>

        <View style={styles.lightCard}>
          <Text style={styles.cardTitle}>Score Distribution</Text>
          <PieChart
            data={pieData}
            width={wp(80)}
            height={hp(25)}
            chartConfig={{ color: () => "#000" }}
            accessor="score"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={styles.lightCard}>
          <Text style={styles.cardTitle}>Body Region Breakdown</Text>
          {PASI_DATA.regions.map((r, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.regionName}>{r.name}</Text>
              <View style={styles.scoreGroup}><Text style={styles.scoreLabel}>Area</Text><Text style={styles.scoreValue}>{r.area}%</Text></View>
              <View style={styles.scoreGroup}><Text style={styles.scoreLabel}>E</Text><Text style={styles.scoreValue}>{r.erythema}</Text></View>
              <View style={styles.scoreGroup}><Text style={styles.scoreLabel}>I</Text><Text style={styles.scoreValue}>{r.induration}</Text></View>
              <View style={styles.scoreGroup}><Text style={styles.scoreLabel}>S</Text><Text style={styles.scoreValue}>{r.scaling}</Text></View>
              <View style={styles.scoreGroup}><Text style={styles.scoreLabel}>Score</Text><Text style={styles.scoreValueBold}>{r.score.toFixed(1)}</Text></View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total PASI</Text>
            <Text style={styles.totalValue}>{PASI_DATA.total.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.lightCard}>
          <Text style={styles.cardTitle}>Treatment Recommendation</Text>
          <Text style={styles.recommendText}>{getRecommendations(PASI_DATA.total)}</Text>
        </View>

        <View style={styles.lightCard}>
          <Text style={styles.cardTitle}>Your Assessment Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Name:</Text><Text style={styles.summaryValue}>{ASSESSMENT_FORM.patientName}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Age:</Text><Text style={styles.summaryValue}>{ASSESSMENT_FORM.age}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Gender:</Text><Text style={styles.summaryValue}>{ASSESSMENT_FORM.gender}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Psoriasis History:</Text><Text style={styles.summaryValue}>{ASSESSMENT_FORM.psoriasisHistory === "first" ? "First time onset" : "Recurring"}</Text></View>
        </View>

        {/* 1 IMAGE ONLY */}
        <View style={styles.lightCard}>
          <Text style={styles.cardTitle}>Affected Area</Text>
            <View style={styles.singleImageContainer}>
                    <Image 
                      source={{ uri: PSORIASIS_IMAGES[0] }} 
                      style={styles.singleUploadedImage} 
                      resizeMode="contain"
                  />
              <Text style={styles.imageLabel}>Image 1</Text>
             
            </View>
        
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={saveToFiles}>
            <MaterialIcons name="folder-open" size={wp(5.5)} color="#1A73E8" />
            <Text style={styles.actionText}>Save to Files</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={sharePDF}>
            <MaterialIcons name="share" size={wp(5.5)} color="#1A73E8" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(12) }} />
      </ScrollView>

      <Modal visible={sidebarVisible} transparent animationType="none">
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} onThemePress={() => setShowColorScheme(true)} />
      </Modal>

      <ColorSchemeModal visible={showColorScheme} onClose={() => setShowColorScheme(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: wp(5), paddingTop: hp(6), paddingBottom: hp(1), backgroundColor: "#FFFFFF" },
  iconButton: { padding: wp(1) },
  avatarContainer: { padding: wp(1) },
  avatar: { width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2.5, borderColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: wp(5), paddingTop: hp(10), paddingBottom: hp(10) },
  title: { fontFamily: "Poppins_600SemiBold", fontSize: wp(6.5), color: "#1A73E8", textAlign: "center", marginBottom: hp(3) },
  ringWrapper: { alignItems: "center", marginVertical: hp(2) },
  ringCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  ringScore: { fontFamily: "Poppins_600SemiBold", fontSize: wp(10), fontWeight: "700" },
  ringLabel: { fontFamily: "Poppins_400Regular", fontSize: wp(3.5), color: "#666", marginTop: hp(0.5) },
  severityText: { fontFamily: "Poppins_500Medium", fontSize: wp(5), marginTop: hp(1) },
  lightCard: { backgroundColor: "#F9F9F9", padding: wp(5), borderRadius: 16, marginVertical: hp(2), elevation: 1 },
  cardTitle: { fontFamily: "Poppins_600SemiBold", fontSize: wp(4.5), color: "#1A73E8", marginBottom: hp(2) },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: hp(1.5), borderBottomWidth: 1, borderColor: "#CCC" },
  regionName: { flex: 2, fontFamily: "Poppins_500Medium", fontSize: wp(4), color: "#000" },
  scoreGroup: { flex: 1, alignItems: "center" },
  scoreLabel: { fontFamily: "Poppins_400Regular", fontSize: wp(3), color: "#666" },
  scoreValue: { fontFamily: "Poppins_500Medium", fontSize: wp(4), color: "#1A73E8", marginTop: hp(0.3) },
  scoreValueBold: { fontFamily: "Poppins_600SemiBold", fontSize: wp(4), color: "#1A73E8", marginTop: hp(0.3) },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: hp(2), marginTop: hp(1), borderTopWidth: 2, borderColor: "#1A73E8" },
  totalLabel: { fontFamily: "Poppins_600SemiBold", fontSize: wp(4.5), color: "#1A73E8" },
  totalValue: { fontFamily: "Poppins_600SemiBold", fontSize: wp(5), color: "#1A73E8" },
  recommendText: { fontFamily: "Poppins_400Regular", fontSize: wp(4), color: "#000", lineHeight: wp(5.5) },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: hp(1), borderBottomWidth: 0.5, borderColor: "#DDD" },
  summaryLabel: { fontFamily: "Poppins_500Medium", fontSize: wp(4), color: "#666" },
  summaryValue: { fontFamily: "Poppins_500Medium", fontSize: wp(4), color: "#1A73E8" },

  // 1 image only
singleImageContainer: {
  alignItems: "center",
  marginTop: hp(1),
},
singleUploadedImage: {
  width: wp(80),           
  height: hp(45),          
  borderRadius: 16,
  backgroundColor: "#F0F0F0",
  marginBottom: hp(1),
  borderWidth: 1,
  borderColor: "#DDD",
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
singleImageLabel: {
  fontFamily: "Poppins_500Medium",
  fontSize: wp(4),
  color: "#555",
},

  actionRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: hp(2) },
  actionBtn: { alignItems: "center", paddingVertical: hp(1) },
  actionText: { fontFamily: "Poppins_500Medium", fontSize: wp(3.5), color: "#1A73E8", marginTop: hp(0.5) },
});