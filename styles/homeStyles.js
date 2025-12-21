import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
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
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  greeting: {
    fontSize: wp(6.5),
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: hp(3),
    paddingHorizontal: wp(6),
  },

  suggestionsWrapper: {
    gap: hp(1.5),                     
  },

  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',        
    alignItems: 'center',
    paddingHorizontal: wp(5),
    gap: wp(3),                       
  },

  suggestionButtonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: hp(1.2),
    borderRadius: wp(3),
  },

  suggestionText: {
    marginLeft: wp(2),
    fontSize: wp(3.6),
    color: '#333',
    fontWeight: '500',
  },

  bottomButtonContainer: {
    paddingHorizontal: wp(7),
    marginBottom: hp(5),
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(1.6),
    borderRadius: wp(2.5),
  },
  startButtonText: {
    color: '#fff',
    fontSize: wp(4.2),
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: wp(1.5),
  },
});

export default styles;
