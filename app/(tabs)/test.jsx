import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import { hp, wp } from '../../helpers/common';

export default function GradientBackground() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={wp(100)} height={hp(100)}>
          <RadialGradient
            c={vec(wp(50), hp(5))}
            r={hp(60)}
            colors={['#0155b0ff', '#0470ddff', '#2a94feff', '#91d0fbff',  '#E0F0FF', '#FFFFFF']}
            positions={[0, 0.3, 0.5, 0.7, 0.85, 1]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    flex: 1,
  },
});