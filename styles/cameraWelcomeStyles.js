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
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3.2),
    fontWeight: '700',
    color: '#333',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: hp(2),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(4),
    lineHeight: hp(2.8),
  },
  preview: {
    width: wp(70),
    height: wp(70),
    borderRadius: 20,
    marginBottom: hp(4),
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee'
  },
  placeholderPreview: {
    width: wp(70),
    height: wp(70),
    borderRadius: 20,
    marginBottom: hp(4),
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(4),
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(5),
    borderRadius: 15,
    minWidth: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: hp(3),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '500'
  }
});

export default styles;
