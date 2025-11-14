// app/(tabs)/result.jsx
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hp, wp } from "../../helpers/common";
import { Sidebar } from "./history";
import { ColorSchemeModal } from "./theme";

const PLACEHOLDER_AVATAR = "https://randomuser.me/api/portraits/women/44.jpg";
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

const RegionRow = ({ region }) => (
  <View style={styles.regionRow}>
    <Text style={styles.regionName}>{region.name}</Text>
    <View style={styles.scores}>
      <Text style={styles.scoreLabel}>Area</Text>
      <Text style={styles.scoreValue}>{region.area}%</Text>
    </View>
    <View style={styles.scores}>
      <Text style={styles.scoreLabel}>E</Text>
      <Text style={styles.scoreValue}>{region.erythema}</Text>
    </View>
    <View style={styles.scores}>
      <Text style={styles.scoreLabel}>I</Text>
      <Text style={styles.scoreValue}>{region.induration}</Text>
    </View>
    <View style={styles.scores}>
      <Text style={styles.scoreLabel}>S</Text>
      <Text style={styles.scoreValue}>{region.scaling}</Text>
    </View>
    <View style={styles.scores}>
      <Text style={styles.scoreLabel}>Score</Text>
      <Text style={styles.scoreValue}>{region.score.toFixed(1)}</Text>
    </View>
  </View>
);

export default function Result() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const sheetAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setShowImageModal(true);
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowImageModal(false));
  };

  const toggleTheme = () => setIsDark(p => !p);
  const openColorScheme = () => setShowColorScheme(true);
  const closeColorScheme = () => setShowColorScheme(false);

  const getSeverityColor = () =>
    PASI_DATA.total < 10 ? "#4CAF50" : PASI_DATA.total < 20 ? "#FF9800" : "#F44336";

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <MaterialIcons name="menu" size={wp(7)} color="#888" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: PLACEHOLDER_AVATAR }} style={styles.avatarImage} />
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>PASI Assessment</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Total PASI Score</Text>
          <Text style={[styles.totalScore, { color: getSeverityColor() }]}>
            {PASI_DATA.total.toFixed(1)}
          </Text>
          <Text style={[styles.severity, { color: getSeverityColor() }]}>
            {PASI_DATA.severity} Psoriasis
          </Text>
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Body Region Breakdown</Text>
          {PASI_DATA.regions.map((r, i) => (
            <RegionRow key={i} region={r} />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total PASI</Text>
            <Text style={styles.totalValue}>{PASI_DATA.total.toFixed(1)}</Text>
          </View>
        </View>

        <View style={{ height: hp(15) }} />
      </ScrollView>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity style={styles.uploadButton} onPress={openModal}>
        <Text style={styles.uploadText}>Upload Images</Text>
        <View style={styles.uploadIcon}>
          <MaterialIcons name="upload" size={wp(5.5)} color="white" />
        </View>
      </TouchableOpacity>

      {/* SIDEBAR MODAL - BULLETPROOF TAP TO CLOSE */}
      <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={() => setSidebarVisible(false)}>
        <View
          style={StyleSheet.absoluteFill}
          onStartShouldSetResponder={() => {
            setSidebarVisible(false);
            return true;
          }}
          pointerEvents="box-none"
        />

        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onThemePress={openColorScheme}
        />
      </Modal>

      {/* IMAGE MODAL */}
      <Modal visible={showImageModal} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.darkOverlay, { opacity: overlayAnim }]} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetAnim }] }]}>
            <View style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <Text style={styles.modalTitle}>Image Assessment</Text>
              <TouchableOpacity style={styles.modalPrimaryButton}>
                <Text style={styles.modalPrimaryText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryText}>Use Camera</Text>
              </TouchableOpacity>
              <Text style={styles.sheetHint}>Ensure good lighting and clear skin view</Text>
            </View>
          </Animated.View>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />
        </View>
      </Modal>

      {/* THEME MODAL */}
      <ColorSchemeModal
        visible={showColorScheme}
        onClose={closeColorScheme}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(6),
    paddingTop: hp(5),
    paddingBottom: hp(1),
    backgroundColor: "#F9F9F9",
    zIndex: 1000,
  },
  menuButton: { padding: wp(1) },
  avatarContainer: { padding: wp(1) },
  avatarImage: { width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2.5, borderColor: "#FFF" },
  scrollContent: { paddingTop: hp(12), paddingHorizontal: wp(6), paddingBottom: hp(10) },
  title: { fontSize: wp(7), fontWeight: "700", color: "#1A73E8", textAlign: "center", marginBottom: hp(3) },
  scoreCard: {
    backgroundColor: "#FFF",
    padding: wp(5),
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
    marginBottom: hp(3),
  },
  scoreLabel: { fontSize: wp(4), color: "#666", marginBottom: hp(0.5) },
  totalScore: { fontSize: wp(12), fontWeight: "800", marginVertical: hp(1) },
  severity: { fontSize: wp(5), fontWeight: "600" },
  breakdownCard: {
    backgroundColor: "#FFF",
    padding: wp(5),
    borderRadius: 20,
    elevation: 2,
    marginBottom: hp(3),
  },
  breakdownTitle: { fontSize: wp(4.8), fontWeight: "700", color: "#333", marginBottom: hp(2) },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1.8),
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  regionName: { flex: 2, fontSize: wp(4), color: "#333", fontWeight: "500" },
  scores: { flex: 1, alignItems: "center" },
  scoreValue: { fontSize: wp(4.2), fontWeight: "600", color: "#1A73E8" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: hp(2),
    marginTop: hp(1),
    borderTopWidth: 2,
    borderColor: "#1A73E8",
  },
  totalLabel: { fontSize: wp(4.5), fontWeight: "700", color: "#1A73E8" },
  totalValue: { fontSize: wp(5), fontWeight: "800", color: "#1A73E8" },
  uploadButton: {
    position: "absolute",
    bottom: hp(3),
    left: wp(6),
    right: wp(6),
    backgroundColor: "#1A73E8",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: hp(7.5),
    borderRadius: 50,
    elevation: 6,
    zIndex: 999,
  },
  uploadText: { color: "#FFF", fontSize: wp(4.3), fontWeight: "600", marginRight: wp(2) },
  uploadIcon: {
    backgroundColor: "rgba(255,255,255,0.25)",
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  bottomSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: wp(6), paddingTop: hp(2.5), paddingBottom: hp(6) },
  sheetHandle: { width: wp(12), height: 5, backgroundColor: "#DDD", alignSelf: "center", borderRadius: 3, marginBottom: hp(2.2) },
  modalTitle: { fontSize: wp(5.4), fontWeight: "700", color: "#000", textAlign: "center", marginBottom: hp(3.2) },
  modalPrimaryButton: {
    backgroundColor: "#1A73E8",
    paddingVertical: hp(2),
    borderRadius: 50,
    height: hp(6.8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.8),
  },
  modalPrimaryText: { color: "#FFF", fontSize: wp(4.3), fontWeight: "600" },
  modalSecondaryButton: {
    backgroundColor: "#F2F2F2",
    paddingVertical: hp(2),
    borderRadius: 50,
    height: hp(6.8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.8),
  },
  modalSecondaryText: { color: "#555", fontSize: wp(4.3), fontWeight: "600" },
  sheetHint: { fontSize: wp(3.8), color: "#888", textAlign: "center", marginTop: hp(1.5) },
});