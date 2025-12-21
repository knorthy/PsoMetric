import { StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },

  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
    paddingBottom: hp(2),
    backgroundColor: '#f9f9f9',
  },

  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  headerTitleContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: wp(10) 
  },

  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000' 
  },

  rightButton: { 
    width: 50, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  editButtonText: { 
    fontSize: 17, 
    color: '#007AFF', 
    fontWeight: '600' 
  },

  scrollContent: { 
    paddingBottom: hp(5) 
  },

  content: { 
    flex: 1 
  },

  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },

  avatarSection: { 
    alignItems: 'center', 
    marginBottom: hp(4), 
    paddingTop: hp(3) 
  },

  avatar: { 
    width: wp(38), 
    height: wp(38), 
    borderRadius: wp(19) 
  },

  avatarPlaceholder: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(19),
  },

  name: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: hp(2.5) 
  },

  nameInput: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 14,
    marginTop: hp(2),
    width: '85%',
  },

  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    borderRadius: 16,
    padding: wp(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
  },

  infoContent: { 
    flex: 1, 
    marginLeft: wp(4) 
  },

  infoText: { 
    fontSize: 17 
  },

  label: { 
    fontSize: 13, 
    color: '#888', 
    marginTop: 4 
  },

  passwordDisplayContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: wp(4),
  },

  divider: { 
    height: 1, 
    backgroundColor: '#eee', 
    marginVertical: hp(3) 
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(2),
  },

  passwordRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: hp(1.8) 
  },

  passwordInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginLeft: wp(4),
  },

  passwordInput: { 
    flex: 1, 
    fontSize: 17, 
    paddingHorizontal: 14, 
    paddingVertical: 12 
  },

  eyeIcon: { 
    paddingHorizontal: 12 
  },

  buttonContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: wp(5), 
    paddingVertical: hp(3), 
    paddingBottom: hp(5), 
    gap: wp(3) 
  },

  actionButton: { 
    flex: 1, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },

  saveButton: { 
    backgroundColor: '#007AFF' 
  },

  cancelButton: { 
    backgroundColor: '#eee' 
  },

  saveText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '600' 
  },

  cancelText: { 
    color: '#333', 
    fontSize: 17, 
    fontWeight: '600' 
  },

  editPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  changePasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
});

export default styles;
