import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AvatarBottomSheet from '../../components/AvatarBottomSheet';
import History from '../../components/history';
import { hp, wp } from '../../helpers/common';

// Image sets with captions
const howToTakeImages = [
  { source: require('../../assets/images/guide/p1.png'), label: 'Take images in a well-lit area' },
  { source: require('../../assets/images/guide/p2.png'), label: 'Images should be centered and not cropped' },
  { source: require('../../assets/images/guide/p3.png'), label: 'Do not put creams or cover ups' },
  { source: require('../../assets/images/guide/p4.png'), label: 'Clear and focused' },
];

const whatToUploadImages = [
  { source: require('../../assets/images/guide/p5.png'), label: 'Accepted image formats' },
  { source: require('../../assets/images/guide/p6.png'), label: 'Capture images against a plain background' },
  { source: require('../../assets/images/guide/p7.png'), label: 'Dont upload irrelevant images' },
  { source: require('../../assets/images/guide/p8.png'), label: 'No filters or edit' },
];

export default function CameraWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const questionnaireParams = useLocalSearchParams();
  const [uploading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  const handleSelectAssessment = (assessment) => {
    console.log('Selected assessment:', assessment);
    setHistoryVisible(false); 
  };

  // Close bottom sheet when navigating away
  useEffect(() => {
    return () => {
      if (sheetRef.current) {
        sheetRef.current?.dismiss();
      }
    };
  }, []);

  const goToCamera = () => {
    router.push({
      pathname: '/camera-welcome',
      params: questionnaireParams,
    });
  };

  // Reusable component for image + label
  const GuideImageItem = ({ source, label }) => (
    <View style={styles.imageItem}>
      <Image source={source} style={styles.guideImage} resizeMode="cover" />
      <Text style={styles.imageLabel}>{label}</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setHistoryVisible(true)}
            >
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerBlue}>Let's get you</Text>{'\n'}
          <Text style={styles.headerBlue}>started!</Text>
        </Text>

        {/* Photo Guide Card – How to Take Images */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Photo Guide</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Take Images</Text>
            <View style={styles.imageGrid}>
              {howToTakeImages.map((item, index) => (
                <GuideImageItem
                  key={`how-${index}`}
                  source={item.source}
                  label={item.label}
                />
              ))}
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Ensure images are clear, centered, and well-lit; avoid cover-ups or topical applications.
            </Text>
          </View>
        </View>

        {/* Image Requirements Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Image Requirements</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of images to upload</Text>
            <View style={styles.imageGrid}>
              {whatToUploadImages.map((item, index) => (
                <GuideImageItem
                  key={`req-${index}`}
                  source={item.source}
                  label={item.label}
                />
              ))}
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Upload clear, relevant, and unedited photos against a plain background
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* FAB Button */}
      {!isOpen && (
        <View style={[styles.fabContainer, { paddingBottom: insets.bottom + hp(3) }]}>
          <TouchableOpacity
            style={[styles.fabButton, uploading && styles.buttonDisabled]}
            onPress={goToCamera}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size={28} color="#fff" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={28} color="#fff" />
                <Text style={styles.fabText}>Let's Get Started</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <History
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onSelectAssessment={handleSelectAssessment}
      />

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onDismiss={() => setisOpen(false)}
        style={{ zIndex: 2000 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.45}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView>
          <AvatarBottomSheet
            onPick={(option) => {
              sheetRef.current?.dismiss();
            }}
            onClose={() => sheetRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingTop: Platform.select({ ios: hp(1.5), android: hp(4) }),
    paddingBottom: hp(2.5),
    marginTop: Platform.select({ ios: 0, android: hp(1) }),
  },
  avatarContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatar: { width: '100%', height: '100%' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(6), paddingBottom: hp(20) },
  headerTitle: { fontSize: hp(3.5), fontWeight: '700', marginBottom: hp(3), marginTop: hp(0.1) },
  headerBlue: { color: '#007AFF' },

  guideCard: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: wp(5), marginBottom: hp(3) },
  guideTitle: { fontSize: hp(2.2), fontWeight: '700', color: '#333', marginBottom: hp(2) },
  section: { marginBottom: hp(2) },
  sectionTitle: { fontSize: hp(2), fontWeight: '600', color: '#333', marginBottom: hp(1.5) },
  
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
    justifyContent: 'space-between',
  },

  // Wrapper for each image
  imageItem: {
    width: (wp(78) - wp(5)) / 2,
    alignItems: 'center',
  },

  guideImage: {
    width: '100%',
    height: wp(28),
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },

  // Label style
  imageLabel: {
    marginTop: hp(1),
    fontSize: hp(1.4),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  note: { fontSize: hp(1.6), color: '#666', lineHeight: hp(2.2), marginTop: hp(1) },
  noteBold: { fontWeight: '700', color: '#333' },

  loadingOverlay: { alignItems: 'center', marginVertical: hp(4) },
  loadingText: { marginTop: hp(2), fontSize: hp(2), color: '#007AFF', fontWeight: '600' },

  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  fabButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.3),
    borderRadius: 30,
    gap: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 16,
    elevation: 20,
  },
  fabText: { color: 'white', fontSize: hp(1.8), fontWeight: '700' },
  buttonDisabled: { backgroundColor: '#999', opacity: 0.8 },
});