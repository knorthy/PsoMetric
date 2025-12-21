import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

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

  avatar: { 
    width: '100%', 
    height: '100%' 
  },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'transparent' },

  pageTitle: {
    fontSize: hp(3.4),
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: hp(1),
  },

  scrollContent: { 
    paddingHorizontal: wp(6), 
    paddingBottom: hp(15) 
  },

  summaryCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 28,
    paddingVertical: hp(5),
    alignItems: 'center',
    marginBottom: hp(4),
    borderWidth: 1.5,
    borderColor: '#E0ECFF',
  },

  summaryMainScore: { 
    fontSize: hp(8), 
    fontWeight: '900', 
    color: '#003087' 
  },

  outOf72: { 
    fontSize: hp(2.4), 
    color: '#888', 
    marginBottom: hp(3) 
  },

  severityPill: { 
    paddingHorizontal: wp(6), 
    paddingVertical: hp(1.2), 
    borderRadius: 30, 
    marginBottom: hp(3) 
  },

  severityPillText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: hp(2.2) 
  },

  summaryDescription: { 
    fontSize: hp(2.2), 
    color: '#444', 
    textAlign: 'center', 
    lineHeight: hp(3.2), 
    paddingHorizontal: wp(6) 
  },

  quickFacts: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: hp(4) 
  },

  factBox: {
    width: '48%',
    backgroundColor: '#F7F7FC',
    borderRadius: 20,
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    alignItems: 'center',
  },

  factLabel: { 
    fontSize: hp(1.9), 
    color: '#666', 
    marginBottom: hp(0.8) 
  },

  factValue: { 
    fontSize: hp(2.4), 
    fontWeight: '600', 
    color: '#333' 
  },

  sectionTitle: {
    fontSize: hp(2.8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(2),
    marginTop: hp(4),
  },

  subSectionTitle: {
    fontSize: hp(2.2),
    fontWeight: '700',
    color: '#007AFF',
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },

  detailCard: {
    backgroundColor: '#F9F9FE',
    borderRadius: 20,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E5FF',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },

  detailLabel: { 
    fontSize: hp(2), 
    color: '#555', 
    flex: 1 
  },

  detailValue: { 
    fontSize: hp(2), 
    color: '#000', 
    fontWeight: '600', 
    textAlign: 'right', 
    flex: 1 
  },

  imagesScroll: { 
    marginBottom: hp(4) 
  },

  imageContainer: {
    width: wp(65),
    height: wp(85),
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: wp(4),
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },

  uploadedImage: { 
    width: '100%', 
    height: '100%' 
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    padding: wp(3),
  },

  imageLabel: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: hp(1.9) 
  },

  noImagesCard: {
    height: wp(85),
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    marginBottom: hp(4),
  },

  noImagesText: { 
    marginTop: hp(2), 
    color: '#aaa', 
    fontSize: hp(2.1) 
  },

  recommendationsCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 24,
    paddingVertical: hp(3.5),
    paddingHorizontal: wp(6),
    marginBottom: hp(3),
    borderWidth: 1.5,
    borderColor: '#D6EBFF',
  },

  recSectionTitle: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: hp(1.5),
  },

  recItem: { 
    fontSize: hp(2.2), 
    color: '#333', 
    lineHeight: hp(3.4), 
    marginBottom: hp(1) 
  },

  recNote: {
    fontSize: hp(2),
    color: '#555',
    lineHeight: hp(2.8),
    fontStyle: 'italic',
  },

  alwaysRec: { 
    marginTop: hp(2.5), 
    paddingTop: hp(2.5), 
    borderTopWidth: 1, 
    borderTopColor: '#B8DCFF' 
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: wp(6),
    paddingVertical: hp(2),
    paddingBottom: Platform.OS === 'ios' ? hp(2) : hp(1),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: hp(2),
    marginRight: wp(3),
  },

  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: hp(2),
  },

  btnTextSecondary: { 
    color: '#007AFF', 
    fontWeight: '600', 
    fontSize: hp(2.2), 
    marginLeft: wp(2) 
  },

  btnTextPrimary: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: hp(2.2), 
    marginLeft: wp(2) 
  },

  // AI Analysis Styles
  aiAnalysisCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: wp(5),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: '#E5E5FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisImageContainer: {
    width: '100%',
    height: hp(30),
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: hp(2),
    backgroundColor: '#f0f0f0',
  },
  analysisImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: hp(20),
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  segmentationNote: {
    fontSize: hp(1.8),
    color: '#666',
    fontStyle: 'italic',
    marginBottom: hp(1),
  },
  overlayToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  overlayToggleLabel: {
    fontSize: hp(2),
    color: '#333',
    fontWeight: '600',
  },
  symptomRow: {
    marginBottom: hp(2),
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  symptomLabel: {
    fontSize: hp(2),
    fontWeight: '600',
    color: '#444',
  },
  symptomScore: {
    fontSize: hp(2),
    fontWeight: '700',
  },
  progressBarBg: {
    height: hp(1.2),
    backgroundColor: '#EFEFF4',
    borderRadius: hp(1),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: hp(1),
  },
});

export default styles;
