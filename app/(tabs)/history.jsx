// components/HistorySidebar.jsx
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { hp, wp } from "../../helpers/common";

// === PERSISTENT ANIMATED VALUES (created once, outside component) ===
const SIDEBAR_WIDTH = wp(70);
const slideAnim = new Animated.Value(-SIDEBAR_WIDTH);
const overlayAnim = new Animated.Value(0);

export const Sidebar = ({ visible, onClose, onThemePress, isDark }) => {
  // === ANIMATION: runs every time `visible` changes ===
  useEffect(() => {
    Animated.parallel([
      // Smooth spring slide (in AND out)
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : -SIDEBAR_WIDTH,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      // Dim fade in/out
      Animated.timing(overlayAnim, {
        toValue: visible ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  // Arrow rotation (sync with dim)
  const rotate = overlayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Optional: fade sidebar in/out for polish
  const sidebarOpacity = slideAnim.interpolate({
    inputRange: [-SIDEBAR_WIDTH, 0],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // === SAMPLE DATA ===
  const historyItems = [
    "PASI Score: 12.4 – Moderate psoriasis with 30% body coverage. Erythema and scaling prominent on trunk and lower limbs. Recommend increasing topical steroid potency and adding emollient therapy.",
    "PASI Score: 8.7 – Mild psoriasis. Lesions mostly on elbows and knees. Good response to current treatment. Continue calcipotriene + betamethasone dipropionate.",
    "PASI Score: 15.1 – Moderate. Upper limbs show significant induration. Consider initiating narrowband UVB phototherapy 3x/week in addition to topicals.",
    "PASI Score: 6.2 – Very mild. Isolated plaques on scalp. Patient reports excellent control with shampoo and occasional topical use.",
    "PASI Score: 18.3 – Moderate to severe. Widespread plaques with nail involvement. Biologic therapy (e.g., adalimumab) may be indicated. Refer to dermatology.",
  ];

  return (
    <>
      {/* === DIMMED OVERLAY (tap anywhere to close) === */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(0,0,0,0.45)",
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose} // Triggers smooth slide back
        />
      </Animated.View>

      {/* === SIDEBAR (always mounted, slides from left) === */}
      <Animated.View
        style={[
          styles.sidebar,
          isDark && styles.sidebarDark,
          {
            transform: [{ translateX: slideAnim }],
            opacity: sidebarOpacity,
          },
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <SafeAreaView style={styles.sidebarSafe}>
          {/* SEARCH BAR */}
          <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
            <MaterialIcons name="search" size={wp(5)} color={isDark ? "#888" : "#AAA"} />
            <TextInput
              placeholder="Search assessments"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              style={[styles.searchInput, isDark && styles.searchInputDark]}
            />
          </View>

          {/* ASSESS BUTTON */}
          <TouchableOpacity style={styles.assessButton}>
            <MaterialIcons name="add-circle-outline" size={wp(5.5)} color="#1A73E8" />
            <Text style={styles.assessText}>Assess new symptoms</Text>
          </TouchableOpacity>

          {/* RECENT LABEL */}
          <Text style={[styles.recentLabel, isDark && styles.recentLabelDark]}>Recent</Text>

          {/* HISTORY LIST */}
          <ScrollView
            showsVerticalScrollIndicator
            indicatorStyle={isDark ? "white" : "black"}
            style={styles.historyScroll}
            contentContainerStyle={{ paddingBottom: hp(4) }}
          >
            {historyItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.historyItem, isDark && styles.historyItemDark]}
                onPress={onClose} // Also closes smoothly
              >
                <Text style={[styles.historyText, isDark && styles.historyTextDark]} numberOfLines={3}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* === BOTTOM BAR === */}
          <View style={styles.bottomBar}>
            {/* THEME TOGGLE */}
            <TouchableOpacity onPress={onThemePress} style={styles.themeBtn}>
              <View style={styles.themeIconWrapper}>
                <MaterialIcons name="dark-mode" size={wp(5.5)} color="#FFF" />
              </View>
            </TouchableOpacity>

            {/* CLOSE BUTTON (double arrow) */}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <View style={styles.doubleArrow}>
                  <MaterialIcons
                    name="chevron-left"
                    size={wp(5.5)}
                    color={isDark ? "#CCC" : "#555"}
                    style={{ marginRight: -wp(1.2) }}
                  />
                  <MaterialIcons
                    name="chevron-left"
                    size={wp(5.5)}
                    color={isDark ? "#CCC" : "#555"}
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

/* === STYLES === */
const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#F5F5F5",
    elevation: 10,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  sidebarDark: {
    backgroundColor: "#0B0E1A",
  },

  sidebarSafe: {
    flex: 1,
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    paddingHorizontal: wp(4),
    height: hp(6),
    marginBottom: hp(3),
    elevation: 1,
  },
  searchContainerDark: {
    backgroundColor: "#1A1F2E",
    elevation: 0,
  },

  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: wp(4),
    color: "#333",
  },
  searchInputDark: {
    color: "#E0E0E0",
  },

  assessButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  assessText: {
    marginLeft: wp(2),
    fontSize: wp(4.2),
    color: "#1A73E8",
    fontWeight: "500",
  },

  recentLabel: {
    fontSize: wp(3.8),
    color: "#666",
    marginBottom: hp(1.5),
    fontWeight: "600",
  },
  recentLabelDark: {
    color: "#BBBBBB",
  },

  historyScroll: {
    flex: 1,
    marginTop: hp(1),
  },

  historyItem: {
    backgroundColor: "#FFFFFF",
    padding: wp(4),
    borderRadius: 16,
    marginBottom: hp(1.5),
  },
  historyItemDark: {
    backgroundColor: "#1A1F2E",
  },

  historyText: {
    fontSize: wp(3.7),
    color: "#333",
    lineHeight: wp(5.2),
    fontWeight: "500",
  },
  historyTextDark: {
    color: "#E0E0E0",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginTop: hp(2),
  },

  themeBtn: {
    padding: wp(1),
  },
  themeIconWrapper: {
    width: wp(10),
    height: wp(10),
    backgroundColor: "#1A73E8",
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },

  closeBtn: {
    padding: wp(1),
  },
  doubleArrow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default function HistoryPlaceholder() {
  return null;
}