import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../helpers/common';

export default function CameraWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const questionnaireParams = useLocalSearchParams();

  const [uploading] = useState(false); 

 
  const goToCamera = () => {
    router.push({
      pathname: '/camera-welcome', 
      params: questionnaireParams, // forward any questionnaire params if needed
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarContainer}>
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

        {/* Photo Guide Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Photo Guide</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Take Images</Text>
            <View style={styles.imageGrid}>
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Take photos in bright natural light...
            </Text>
          </View>
        </View>

        {/* Image Requirements Card */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Image Requirements</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of images to upload</Text>
            <View style={styles.imageGrid}>
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
              <View style={styles.imagePlaceholder} />
            </View>
            <Text style={styles.note}>
              <Text style={styles.noteBold}>NOTE:</Text> Upload clear, well-lit images...
            </Text>
          </View>
        </View>

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing your skin...</Text>
          </View>
        )}
      </ScrollView>

      {/* Single FAB Button */}
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
    </SafeAreaView>
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
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(3), marginBottom: hp(2) },
  imagePlaceholder: { width: (wp(78) - wp(5)) / 2, height: wp(28), backgroundColor: '#E0E0E0', borderRadius: 12 },
  note: { fontSize: hp(1.6), color: '#666', lineHeight: hp(2.2) },
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
  fabText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.8,
  },
});