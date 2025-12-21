import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from '../../components/AuthContext.jsx';
import AvatarBottomSheet from '../../components/AvatarBottomSheet.jsx';
import History from '../../components/history';
import { wp } from '../../helpers/common';
import { getAssessmentForNavigation, loadAssessmentHistory } from '../../services/historyUtils';
import styles from '../../styles/homeStyles';

export default function App() {
  const { user, session, avatar } = useAuth();

  const formatName = (raw) => {
    if (!raw) return 'there';
    const str = String(raw).trim();
    if (!str) return 'there';
    const first = str.split(/\s+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };
  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  const router = useRouter();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    if (historyVisible) {
      loadHistory();
    }
  }, [historyVisible]);

  const loadHistory = async () => {
    try {
      const formatted = await loadAssessmentHistory();
      setAssessments(formatted);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const handleSelectAssessment = async (assessment) => {
    try {
      setHistoryVisible(false);
      const params = await getAssessmentForNavigation(assessment);
      router.push({ pathname: '/result', params });
    } catch (error) {
      console.error('Error fetching assessment:', error);
      router.push({ pathname: '/result', params: assessment });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topBar}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => setHistoryVisible(true)}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </TouchableOpacity>
      </View>

      {/* Center content wrapper */}
      <View style={styles.centerContent}>
        <Text style={styles.greeting}>Hello, {formatName(session?.name || user?.username)}!</Text>

        <View style={styles.suggestionsWrapper}>
          {/* Row 1 */}
          <View style={styles.suggestionsContainer}>
            {suggestions.slice(0, 2).map((item, idx) => {
              const buttonStyle = [
                styles.suggestionButtonBase,
                item.style, 
              ];

              return (
                <TouchableOpacity key={idx} style={buttonStyle}>
                  <item.Icon name={item.icon} size={18} color={item.color} />
                  <Text style={styles.suggestionText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Row 2 */}
          <View style={styles.suggestionsContainer}>
            {suggestions.slice(2, 4).map((item, idx) => {
              const buttonStyle = [
                styles.suggestionButtonBase,
                item.style, 
              ];

              return (
                <TouchableOpacity key={idx + 2} style={buttonStyle}>
                  <item.Icon name={item.icon} size={18} color={item.color} />
                  <Text style={styles.suggestionText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Bottom button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/assess')}
        >
          <Text style={styles.startButtonText}>Start the Assessment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      <History
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
          onSelectAssessment={handleSelectAssessment}
          assessments={assessments}
        />
    </SafeAreaView>

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onDismiss={() => setisOpen(false)}
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
              onPick={(option) => {
                sheetRef.current?.dismiss();
                
              }}
              onClose={() => sheetRef.current?.dismiss()}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}


const suggestions = [
  {
    Icon: MaterialCommunityIcons,
    icon: 'lightbulb-on-outline',
    color: '#FF9500',
    label: 'Tell me what to do',
    style: { paddingHorizontal: wp(4.5) }, 
  },
  {
    Icon: Ionicons,
    icon: 'school-outline',
    color: '#FF2D55',
    label: 'Educate',
    style: { paddingHorizontal: wp(4) },
  },
  {
    Icon: Ionicons,
    icon: 'help-circle-outline',
    color: '#007AFF',
    label: 'Help me',
    style: { paddingHorizontal: wp(4) },
  },
  {
    Icon: Ionicons,
    icon: 'gift-outline',
    color: '#34C759',
    label: 'Give tips',
    style: { paddingHorizontal: wp(4) },
  },
];