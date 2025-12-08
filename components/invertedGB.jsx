import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { Dimensions, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { hp, wp } from '../helpers/common';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const TOTAL_HEIGHT = SCREEN_HEIGHT + STATUS_BAR_HEIGHT;

export default function GradientBackground() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={wp(100)} height={TOTAL_HEIGHT}>
          <RadialGradient
            c={vec(wp(50), hp(5))}
            r={hp(85)}
            colors={['#0155b0ff', '#0470ddff', '#2a94feff', '#91d0fbff', '#E0F0FF', '#FFFFFF']}
            positions={[0, 0.25, 0.45, 0.65, 0.82, 1]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: -STATUS_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    flex: 1,
  },
});