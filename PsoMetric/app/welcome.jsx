import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import SignupBottomSheet from '../../components/SignupBottomSheet.jsx';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

const data = [
  { image: require('../../assets/images/welcome/image_1.png') },
  { image: require('../../assets/images/welcome/image_2.png') },
  { image: require('../../assets/images/welcome/image_3.png') },
  { image: require('../../assets/images/welcome/image_4.png') },
];

export default function Welcome() {
  const sheetRef = useRef(null);
  const router = useRouter();
  const [isOpen, setisOpen] = useState(true);
  const snapPoints = ["40%"];

  const scrollX = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSnapPress = useCallback((index) => {                               
    sheetRef.current?.present(index);
    setisOpen(true);
  }, []);

  const handleTermsPress = () => {
    Linking.openURL('https://www.example.com/terms').catch(() => {});
  };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <Animated.FlatList
              data={data}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: ITEM_SPACING, paddingBottom: 0 }} 
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => {
                return <AnimatedItem item={item} index={index} scrollX={scrollX} />;
              }}
            />
            <Dots data={data} scrollX={scrollX} />
            <View style={styles.content}>
              <Text style={styles.title}>Ready to join the Hunt?</Text>
              <Text style={styles.tagline}>Make your Campus Life Alive with MetaCampus.</Text>
  
              <TouchableOpacity
                style={styles.primaryButton}                                      
                onPress={() => handleSnapPress(0)}>
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/signin')}
            > 
                <Text style={styles.secondaryButtonText}>Sign In</Text>             
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTermsPress} style={styles.termsContainer} activeOpacity={0.7}>     
                <Text style={styles.termsText}>
                  By continuing you agree to our <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <BottomSheetModalProvider>
            <BottomSheetModal
              ref={sheetRef}
              snapPoints={snapPoints}
              enablePanDownToClose={true}
              onDismiss={() => setisOpen(false)}
              backdropComponent={(props) => (
                <BottomSheetBackdrop                      // for darkening background
                  {...props}
                  appearsOnIndex={0}       
                  disappearsOnIndex={-1}   
                  opacity={0.45}           
                  pressBehavior="close"    
                />
              )}
            >
              <BottomSheetView>
                <SignupBottomSheet
                  onPick={(role) => {
              
                    sheetRef.current?.dismiss();
                    
                    setTimeout(() => {
                      if (role === 'student') router.push('/studcreate');
                      else if (role === 'organization') router.push('/orgcreate');
                    }, 220);
                  }}
                  onClose={() => sheetRef.current?.dismiss()}
                />
              </BottomSheetView>
            </BottomSheetModal>
          </BottomSheetModalProvider>
        </View>
      </GestureHandlerRootView>
    );
  }

function AnimatedItem({ item, index, scrollX }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], 'clamp');
    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>      
      <View style={styles.innerItem}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover" 
        />
      </View>
    </Animated.View>
  );
}

function Dots({ data, scrollX }) {
  return (
    <View style={styles.dotsContainer}>
      {data.map((_, index) => {
        return <Dot key={index} index={index} scrollX={scrollX} />;
      })}
    </View>
  );
}

function Dot({ index, scrollX }) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH],
      [8, 16, 8],
      'clamp'
    );
    return {
      width,
    };
  });
  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  item: {
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerItem: {
    width: '100%',
    height: '70%',
    backgroundColor: 'whiteSmoke',
    borderRadius: 16,
    marginBottom: 0, 
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -70, 
  },
  dot: {
    height: 8,
    backgroundColor: 'gray',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  content: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginTop: 15,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#C7FB35',
    paddingVertical: 12,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    marginTop: 17,
  },
  primaryButtonText: {
    color: '#404040ff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#929292ff',
    paddingVertical: 12,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#ffffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  termsContainer: {
    marginTop: 19,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  termsLink: {
    color: '#83b200ff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});