import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import SignupBottomSheet from '../../components/SignupBottomSheet.jsx';
import { hp, wp } from '../../helpers/common';

//testing lang para endi mag duplicate skia
const GradientBackground = require('../../components/GradientBackground.jsx').default;

const ITEM_WIDTH = wp(80);
const ITEM_SPACING = wp(10);

const data = [
  { image: require('../../assets/images/welcome/img3.png') },
  { image: require('../../assets/images/welcome/img2.png') },
  { image: require('../../assets/images/welcome/img1.png') },
  { image: require('../../assets/images/welcome/img4.png') },
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
      
      <View style={StyleSheet.absoluteFill}>
        <GradientBackground />
      </View>
      
      <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: hp(2.5) }}>
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
            <Text style={styles.title}>See Beyond the{"\n"}Surface</Text>
            <Text style={styles.tagline}>Gain control over your condition.</Text>

            <TouchableOpacity
              style={styles.primaryButton}                                      
              onPress={() => handleSnapPress(0)}>
              <Text style={styles.primaryButtonText}>Let's Get Started</Text>
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
              <SignupBottomSheet
                onPick={(role) => {
                  sheetRef.current?.dismiss();
                  
                  setTimeout(() => {
                    if (role === 'create') router.push('/create');
                    else if (role === 'login') router.push('/signin');
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
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], 'clamp', Easing.inOut(Easing.ease));
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
      'clamp',
      Easing.inOut(Easing.ease)
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
    marginTop: hp(4), 
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
    marginTop: hp(2),
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