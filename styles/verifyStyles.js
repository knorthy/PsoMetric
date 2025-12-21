import { StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(10),
    alignItems: 'center',
  },
  titleContainer: {
    width: wp(80),
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: 'black',
    marginBottom: hp(1),
  },
  subText: {
    fontSize: wp(4),
    color: '#666',
    lineHeight: hp(3),
  },
  emailText: {
    fontWeight: 'bold',
    color: '#0085FF',
  },
  inputContainer: {
    width: wp(80),
    marginBottom: hp(3),
  },
  labelText: {
    fontSize: wp(4),
    color: 'black',
    marginBottom: hp(1),
  },
  input: {
    height: hp(6),
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: wp(4),
    fontSize: wp(5),
    letterSpacing: 5,
    textAlign: 'center',
  },
  button: {
    height: hp(6),
    width: wp(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0085FF',
    marginVertical: hp(2),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  textButton: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: 'white',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: hp(2),
  },
  text: {
    fontSize: wp(4),
    color: '#666',
  },
  linkText: {
    color: '#0085FF',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
});

export default styles;
