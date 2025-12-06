import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AvatarBottomSheet from '../../components/AvatarBottomSheet.jsx';
import History from '../../components/history';
import { hp, wp } from '../../helpers/common';

export default function App() {
  const sheetRef = useRef(null);
  const [isOpen, setisOpen] = useState(false);
  const snapPoints = ["25%"];

  const handleAvatarPress = useCallback(() => {
    sheetRef.current?.present();
    setisOpen(true);
  }, []);

  const [historyVisible, setHistoryVisible] = useState(false);

  const handleSelectAssessment = (assessment) => {
  console.log('Selected assessment:', assessment);
  setHistoryVisible(false); 

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
          <Image
            source={require('../../assets/images/avatar.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Center content wrapper */}
      <View style={styles.centerContent}>
        <Text style={styles.greeting}>Hello, Jasmine Vir!</Text>

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
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Start the Assessment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      <History
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
          onSelectAssessment={handleSelectAssessment}
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

  greeting: {
    fontSize: wp(6.5),
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: hp(3),
    paddingHorizontal: wp(6),
  },

  /*  */
  suggestionsWrapper: {
    gap: hp(1.5),                     
  },

  /* Horizontal Row */
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',        
    alignItems: 'center',
    paddingHorizontal: wp(5),
    gap: wp(3),                       
  },

  /*  */
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