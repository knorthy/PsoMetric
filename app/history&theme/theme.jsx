// components/ThemeModal.jsx
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { hp, wp } from "../../helpers/common";

export const ColorSchemeModal = ({
  visible,
  onClose,
  isDark,
  toggleTheme,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible && fadeAnim._value === 0) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* BACKDROP */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* BOTTOM SHEET */}
      <Animated.View
        style={[
          styles.panel,
          isDark && styles.panelDark,
          { transform: [{ translateY: slideAnim }] },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.content, isDark && styles.contentDark]} pointerEvents="auto">
          <Text style={[styles.title, isDark && styles.titleDark]}>Color Scheme</Text>

          {/* LIGHT MODE */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => !isDark && toggleTheme()}
          >
            <View style={styles.icon}>
              <MaterialIcons
                name="light-mode"
                size={wp(5.5)}
                color={isDark ? "#90CAF9" : "#FFB300"}
              />
            </View>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Default Display Light
            </Text>
            <ToggleSwitch isOn={!isDark} isDark={isDark} />
          </TouchableOpacity>

          {/* DARK MODE */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => isDark && toggleTheme()}
          >
            <View style={styles.icon}>
              <MaterialIcons
                name="dark-mode"
                size={wp(5.5)}
                color={isDark ? "#90CAF9" : "#1A73E8"}
              />
            </View>
            <Text style={[styles.label, isDark && styles.labelDark]}>Dark Theme</Text>
            <ToggleSwitch isOn={isDark} isDark={isDark} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

/* ──────── BLUE CHECK/CROSS TOGGLE ──────── */
const ToggleSwitch = ({ isOn, isDark }) => {
  const pos = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(pos, {
      toValue: isOn ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOn]);

  const translate = pos.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(1), wp(7.5)],
  });

  return (
    <View
      style={[
        styles.toggleBg,
        isOn && (isDark ? styles.toggleBgActiveDark : styles.toggleBgActiveLight),
      ]}
    >
      <Animated.View style={[styles.toggleKnob, { transform: [{ translateX: translate }] }]}>
        <MaterialIcons
          name={isOn ? "check" : "close"}
          size={wp(5.5)}
          color="#1A73E8"   // ALWAYS BLUE
          style={{ fontWeight: "bold" }}
        />
      </Animated.View>
    </View>
  );
};

/* ──────── STYLES ──────── */
const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },

  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 12,
  },
  panelDark: { backgroundColor: "#0B0E1A" },

  content: { paddingHorizontal: wp(6), paddingTop: hp(3), paddingBottom: hp(4) },
  contentDark: { backgroundColor: "#0B0E1A" },

  title: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: hp(3),
  },
  titleDark: { color: "#FFFFFF" },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: hp(2.5) },
  icon: { width: wp(10), height: wp(10), justifyContent: "center", alignItems: "center" },
  label: { flex: 1, marginLeft: wp(4), fontSize: wp(4.2), color: "#333", fontWeight: "500" },
  labelDark: { color: "#E0E0E0" },

  // Toggle background
  toggleBg: {
    width: wp(16),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#CCCCCC",
    justifyContent: "center",
    paddingHorizontal: wp(0.5),
  },
  toggleBgActiveLight: { backgroundColor: "#1A73E8" },
  toggleBgActiveDark: { backgroundColor: "#4A90E2" },

  // Toggle knob
  toggleKnob: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default function ThemePlaceholder() { return null; }
