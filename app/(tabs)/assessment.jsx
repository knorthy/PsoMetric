// app/(tabs)/assessment.jsx
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { hp, wp } from "../../helpers/common";
import { Sidebar } from "../history&theme/history";
import { ColorSchemeModal } from "../history&theme/theme";

const PLACEHOLDER_AVATAR = "https://www.hindustantimes.com/ht-img/img/2023/07/15/1600x900/jennie_1689410686831_1689410687014.jpg";

const RadioOption = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.radioItem, selected && styles.radioItemSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.radioDot, selected && styles.radioDotSelected]}>
      {selected && <MaterialIcons name="check" size={wp(4)} color="#FFF" />}
    </View>
    <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function Assessment() {
  const [gender, setGender] = useState("Female");
  const [age, setAge] = useState("");
  const [psoriasisHistory, setPsoriasisHistory] = useState("first");
  const [showImageModal, setShowImageModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const sheetAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setShowImageModal(true);
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowImageModal(false));
  };

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]}>
      {/* HEADER – MATCHES result.jsx */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconButton}>
          <MaterialIcons name="menu" size={wp(6.5)} color={isDark ? "#CCC" : "#666"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={{ uri: PLACEHOLDER_AVATAR }} style={styles.avatar} resizeMode="cover" />
        </TouchableOpacity>
      </View>

      {/* SIDEBAR */}
      <Modal visible={sidebarVisible} transparent animationType="none">
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onThemePress={() => setShowColorScheme(true)}
          isDark={isDark}
        />
      </Modal>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* GREETING */}
        <Text style={[styles.greeting, isDark && styles.greetingDark]}>
          Hello Jasmine,{'\n'}how are you feeling{'\n'}today?
        </Text>

        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Symptom Assessment
        </Text>

        {/* GENDER */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Gender</Text>
          <View style={styles.radioGroup}>
            <RadioOption label="Female" selected={gender === "Female"} onPress={() => setGender("Female")} />
            <RadioOption label="Male" selected={gender === "Male"} onPress={() => setGender("Male")} />
          </View>
        </View>

        {/* AGE */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Age</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="Enter age"
            placeholderTextColor={isDark ? "#777" : "#AAA"}
            keyboardType="numeric"
            style={[styles.input, isDark && styles.inputDark]}
          />
          <View style={styles.underline} />
        </View>

        {/* HISTORY */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.label, isDark && styles.labelDark]}>History of Psoriasis</Text>
          <View style={styles.radioGroup}>
            <RadioOption label="First time onset" selected={psoriasisHistory === "first"} onPress={() => setPsoriasisHistory("first")} />
            <RadioOption label="Recurring" selected={psoriasisHistory === "recurring"} onPress={() => setPsoriasisHistory("recurring")} />
          </View>
        </View>

        <TouchableOpacity style={styles.uploadBtn} onPress={openModal}>
          <MaterialIcons name="cloud-upload" size={wp(5)} color="#FFF" />
          <Text style={styles.uploadText}>Upload Images</Text>
        </TouchableOpacity>

        <View style={{ height: hp(20) }} />
      </ScrollView>

      {/* BOTTOM SHEET MODAL */}
      <Modal visible={showImageModal} transparent animationType="none">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal}>
            <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
          </TouchableOpacity>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Upload Image</Text>
            <TouchableOpacity style={styles.sheetBtnPrimary}>
              <Text style={styles.sheetBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtnSecondary}>
              <Text style={styles.sheetBtnTextSecondary}>Take Photo</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Use well-lit photos for best results</Text>
          </Animated.View>
        </View>
      </Modal>

      <ColorSchemeModal
        visible={showColorScheme}
        onClose={() => setShowColorScheme(false)}
        isDark={isDark}
        toggleTheme={() => setIsDark(p => !p)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  safeDark: { backgroundColor: "#0B0E1A" },

  // HEADER – 100% MATCH result.jsx
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
    paddingBottom: hp(1),
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
  },
  iconButton: { padding: wp(1) },
  avatarContainer: { padding: wp(1) },
  avatar: { width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: 2.5, borderColor: "#FFFFFF" },

  content: { paddingHorizontal: wp(5), paddingTop: hp(15) },

  greeting: { fontSize: wp(7), fontWeight: "700", color: "#1A73E8", lineHeight: wp(8.5), marginBottom: hp(3) },
  greetingDark: { color: "#90CAF9" },

  sectionTitle: { fontSize: wp(5), fontWeight: "600", color: "#333", marginBottom: hp(2.5) },
  sectionTitleDark: { color: "#E0E0E0" },

  card: { backgroundColor: "#FFF", borderRadius: 16, padding: wp(4.5), marginBottom: hp(2.5) },
  cardDark: { backgroundColor: "#1A1F2E" },

  label: { fontSize: wp(4), color: "#555", marginBottom: hp(1.5), fontWeight: "500" },
  labelDark: { color: "#BBB" },

  radioGroup: { gap: hp(1.2) },
  radioItem: { flexDirection: "row", alignItems: "center", paddingVertical: hp(1.6), paddingHorizontal: wp(3), backgroundColor: "#F0F0F0", borderRadius: 12 },
  radioItemSelected: { backgroundColor: "#E3F2FD" },
  radioDot: { width: wp(5), height: wp(5), borderRadius: wp(2.5), borderWidth: 1.5, borderColor: "#999", marginRight: wp(3), justifyContent: "center", alignItems: "center" },
  radioDotSelected: { borderColor: "#1A73E8", backgroundColor: "#1A73E8" },
  radioLabel: { fontSize: wp(4), color: "#666", fontWeight: "500" },
  radioLabelSelected: { color: "#1A73E8", fontWeight: "600" },

  input: { fontSize: wp(4.2), color: "#333", paddingVertical: hp(1) },
  inputDark: { color: "#E0E0E0" },
  underline: { height: 1, backgroundColor: "#DDD", marginTop: 4 },

  uploadBtn: { backgroundColor: "#1A73E8", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: hp(2), borderRadius: 50, gap: wp(2), marginTop: hp(1) },
  uploadText: { color: "#FFF", fontSize: wp(4.1), fontWeight: "600" },

  modalContainer: { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: wp(6), paddingTop: hp(2), paddingBottom: hp(6), maxHeight: hp(60) },
  handle: { width: wp(10), height: 4, backgroundColor: "#DDD", alignSelf: "center", borderRadius: 2, marginBottom: hp(2) },
  sheetTitle: { fontSize: wp(5), fontWeight: "600", textAlign: "center", marginBottom: hp(3) },
  sheetBtnPrimary: { backgroundColor: "#1A73E8", paddingVertical: hp(1.8), borderRadius: 50, alignItems: "center", marginBottom: hp(1.5) },
  sheetBtnSecondary: { backgroundColor: "#F5F5F5", paddingVertical: hp(1.8), borderRadius: 50, alignItems: "center" },
  sheetBtnText: { color: "#FFF", fontSize: wp(4.1), fontWeight: "600" },
  sheetBtnTextSecondary: { color: "#555", fontSize: wp(4.1), fontWeight: "600" },
  hint: { fontSize: wp(3.5), color: "#888", textAlign: "center", marginTop: hp(2) },
});