import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../components/AuthContext';
import AvatarBottomSheet from '../../components/uploadavatar';
import { changePassword, deleteCurrentUser, updateUserAttributes } from '../../services/cognito';
import styles from '../../styles/viewprofileStyles';

const ViewProfileScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  const { user: authUser, session, checkAuthStatus, logout, setAuth, avatar, setAvatar } = useAuth();

  const sheetRef = useRef(null);
  const snapPoints = ["25%"];

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    accountCreated: '',
    signupMethod: '',
    avatar: null,
  });

  const [editedUser, setEditedUser] = useState({
    ...user,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Populate local state from AuthContext/session when available
  useEffect(() => {
    if (session) {
      setUser((u) => ({
        ...u,
        name: session.name || '',
        username: session.username || '',
        email: session.username || '',
      }));

      setEditedUser((e) => ({
        ...e,
        name: session.name || '',
        username: session.username || '',
        email: session.username || '',
      }));
    } else if (authUser) {
      setUser((u) => ({ ...u, username: authUser.username || '' }));
      setEditedUser((e) => ({ ...e, username: authUser.username || '' }));
    }
    // If global avatar exists, populate local states
    if (avatar) {
      setUser((u) => ({ ...u, avatar: { uri: avatar } }));
      setEditedUser((e) => ({ ...e, avatar: { uri: avatar } }));
    }
  }, [session, authUser, avatar]);

  const handleSave = () => {
    // Basic validation for password fields
    if (editedUser.newPassword && editedUser.newPassword !== editedUser.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (editedUser.newPassword && editedUser.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const updates = {};
    if (editedUser.name && editedUser.name !== user.name) updates.name = editedUser.name;
    if (editedUser.email && editedUser.email !== user.email) updates.email = editedUser.email;

    (async () => {
      try {
        if (Object.keys(updates).length) {
          await updateUserAttributes(updates);
        }

        if (editedUser.newPassword) {
          await changePassword(editedUser.currentPassword, editedUser.newPassword);
        }

        // Refresh auth state
        await checkAuthStatus();
        const refreshed = await (async () => {
          try { return session; } catch { return null; }
        })();

        // If the user changed/added an avatar, persist it globally
        try {
          if (editedUser.avatar && editedUser.avatar.uri) {
            await setAvatar(editedUser.avatar.uri);
          }
        } catch (e) {
          console.error('Failed to persist avatar after save', e);
        }

        setIsEditing(false);
        setShowChangePassword(false);
        setEditedUser({ ...editedUser, currentPassword: '', newPassword: '', confirmPassword: '' });

        Alert.alert('Success', 'Profile updated successfully!');
      } catch (err) {
        console.error('Profile update error', err);
        Alert.alert('Update Failed', err.message || 'Could not update profile');
      }
    })();
};

  const handleCancel = () => {
    setEditedUser({
      ...user,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

  // Hide password visibility toggles
  setShowCurrent(false);
  setShowNew(false);
  setShowConfirm(false);

  // Close the Change Password section
  setShowChangePassword(false);

  // Exit edit mode completely
  setIsEditing(false);
};

  const openCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.cancelled && result.uri) {
        setEditedUser({ ...editedUser, avatar: { uri: result.uri } });
      } else if (result.assets && result.assets[0] && result.assets[0].uri) {
        setEditedUser({ ...editedUser, avatar: { uri: result.assets[0].uri } });
      }
    } catch (err) {
      console.error('Camera error', err);
      Alert.alert('Error', 'Could not open camera');
    }
  };

  const openLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library access is required to choose a photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.cancelled && result.uri) {
        setEditedUser({ ...editedUser, avatar: { uri: result.uri } });
      } else if (result.assets && result.assets[0] && result.assets[0].uri) {
        setEditedUser({ ...editedUser, avatar: { uri: result.assets[0].uri } });
      }
    } catch (err) {
      console.error('Image library error', err);
      Alert.alert('Error', 'Could not open image library');
    }
  };

  const pickImage = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleAvatarPick = (option) => {
    sheetRef.current?.dismiss();
    if (option === 'viewProfile') {
      openCamera();
    } else if (option === 'changeAvatar') {
      openLibrary();
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setEditedUser({ ...user, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/signin'); } }
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Delete account', 'This will permanently delete your account. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteCurrentUser();
          await logout();
          router.replace('/signin');
        } catch (err) {
          console.error('Delete user failed', err);
          Alert.alert('Error', err.message || 'Could not delete account');
        }
      } }
    ]);
  };

  const handleGoBack = () => {
    if (returnTo) {
      // Navigate back to the page we came from
      router.replace(returnTo);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          {/* Fixed Header */}
          <View style={styles.fixedHeader}>
        {isEditing ? (
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
        )}

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            My Profile
          </Text>
        </View>

        {!isEditing ? (
          <TouchableOpacity onPress={handleEditToggle} style={styles.rightButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButton} />
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing}>
            {editedUser.avatar ? (
              <Image source={editedUser.avatar} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={60} color="#888" />
                {isEditing && (
                  <View style={styles.cameraIconOverlay}>
                    <Icon name="camera" size={28} color="#fff" />
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={editedUser.name}
              onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
              placeholder="Your name"
              placeholderTextColor="#aaa"
              autoFocus
            />
          ) : (
            <Text style={styles.name}>{user.name}</Text>
          )}
        </View>

        {/* Profile Info Card */}
       <View style={styles.infoCard}>
          {/* Username */}
          <View style={styles.infoRow}>
            <Icon name="at" size={22} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>@{user.username}</Text>
              <Text style={styles.label}>Username</Text>
            </View>
          </View>

         {/* PASSWORD ROW */}
      <View style={styles.infoRow}>
        <Icon name="lock-closed-outline" size={22} color="#007AFF" />
        <View style={styles.infoContent}>
          <View style={styles.passwordDisplayContainer}>
            <View>
              <Text style={styles.infoText}>••••••••</Text>
              <Text style={styles.label}>Password</Text>
            </View>

      {/* Edit */}
      {isEditing && (
        <TouchableOpacity
          onPress={() => setShowChangePassword(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.editPasswordText}>Edit</Text>
        </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

          {/* Email */}
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={22} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{user.email}</Text>
              <Text style={styles.label}>Email</Text>
            </View>
          </View>

          {/* Account Created */}
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={22} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>{user.accountCreated}</Text>
              <Text style={styles.label}>Member since</Text>
            </View>
          </View>

        {/* Sign-up Method */}
          <View style={styles.infoRow}>
            <Icon
              name={user.signupMethod === 'Google' ? 'logo-google' : 
                    user.signupMethod === 'Apple'  ? 'logo-apple'  : 
                    'mail-outline'}
              size={22}
              color="#007AFF"
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Signed up with 
              </Text>
              {}
              <Text style={styles.label}>{user.signupMethod} account</Text>
            </View>
          </View>

      {/* CHANGE PASSWORD SECTION */}
      {isEditing && showChangePassword && (
      <>
    <View style={styles.divider} />

    {/* Header */}
    <View style={styles.changePasswordHeader}>
      <Text style={styles.sectionTitle}>Change Password</Text>
    </View>

    {/* Current Password */}
    <View style={styles.passwordRow}>
      <Icon name="lock-closed-outline" size={22} color="#007AFF" />
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Current password"
          value={editedUser.currentPassword}
          onChangeText={(text) => setEditedUser({ ...editedUser, currentPassword: text })}
          secureTextEntry={!showCurrent}
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Icon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>

    {/* New Password */}
    <View style={styles.passwordRow}>
      <Icon name="key-outline" size={22} color="#007AFF" />
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New password"
          value={editedUser.newPassword}
          onChangeText={(text) => setEditedUser({ ...editedUser, newPassword: text })}
          secureTextEntry={!showNew}
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Confirm Password */}
    <View style={styles.passwordRow}>
      <Icon name="checkmark-circle-outline" size={22} color="#007AFF" />
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm new password"
          value={editedUser.confirmPassword}
          onChangeText={(text) => setEditedUser({ ...editedUser, confirmPassword: text })}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
        </TouchableOpacity>
          </View>
        </View>
      </>
    )}
  </View>

        {/* Save/Cancel buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

        </SafeAreaView>

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
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
              onPick={handleAvatarPick}
              onClose={() => sheetRef.current?.dismiss()}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default ViewProfileScreen;