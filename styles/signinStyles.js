import { StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative' },
  container: {
    alignItems: 'center',
    paddingBottom: hp(5),
  },
  titleContainer: {
    width: wp(80),
    alignItems: 'flex-start',
    marginTop: hp(5),
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(6.5),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputContainer: {
    width: wp(80),
    marginBottom: hp(2),
  },
  labelText: {
    fontSize: wp(4),
    color: '#ffffff',
    marginBottom: hp(0.5),
  },
  input: {
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    fontSize: wp(4),
    color: '#000',
  },
  passwordInputWrapper: {
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  passwordInput: {
    flex: 1,
    fontSize: wp(4),
    color: '#000',
    height: '100%',
  },
  eyeButton: {
    padding: wp(2),
  },
  button: {
    height: hp(6),
    width: wp(80),
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(2),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    color: '#50a2ffff',
    fontSize: wp(4.5),
    fontWeight: '600',
  },
  signupText: {
    fontSize: wp(4),
    color: '#555',
    marginTop: hp(2),
  },
  signup: {
    color: '#0085FF',
    fontWeight: 'bold',
  },
});

export default styles;
