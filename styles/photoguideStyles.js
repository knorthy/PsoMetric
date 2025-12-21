import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

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
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'transparent' },
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

export default styles;
