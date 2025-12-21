import { StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const ITEM_WIDTH = wp(80);

const styles = StyleSheet.create({
  item: {
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(6),
  },
  innerItem: {
    width: '100%',
    height: hp(42),
    backgroundColor: 'whiteSmoke',
    borderRadius: wp(3),
    marginBottom: 0, 
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: wp(3),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(6), 
  },
  dot: {
    height: wp(2),
    backgroundColor: '#ffffffff',
    borderRadius: wp(1),
    marginHorizontal: wp(1),
  },
  content: {
    width: '100%',
    paddingHorizontal: wp(6),
    alignItems: 'center',
    marginTop: hp(3),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: '700',
    color: '#ffffffff',
    textAlign: 'left',
    marginLeft: wp(-23),
    marginTop: hp(3.5),
    lineHeight: hp(4.2),
  },
  tagline: {
    fontSize: hp(1.75),
    color: '#ffffffff',
    textAlign: 'left',
    marginLeft: wp(-22),
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  primaryButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: hp(1.5),
    borderRadius: wp(4),
    width: wp(80),
    alignItems: 'center',
    marginTop: hp(3.5),
  },
  primaryButtonText: {
    color: '#348fccff',
    fontWeight: '700',
    fontSize: hp(2),
  },
  termsContainer: {
    marginTop: hp(2.5),
    paddingHorizontal: wp(4),
  },
  termsText: {
    fontSize: hp(1.5),
    color: '#ffffffff',
    textAlign: 'center',
  },
  termsLink: {
    color: '#ffffffff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

// Export constants for use in the component
export const ITEM_WIDTH_CONST = ITEM_WIDTH;
export const ITEM_SPACING = wp(10);

export default styles;
