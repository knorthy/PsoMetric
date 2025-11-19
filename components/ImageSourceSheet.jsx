// components/ImageSourceSheet.jsx
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { hp, wp } from '../../helpers/common';
const ImageSourceSheet = React.forwardRef(({ onTakePhoto, onPickImage, isUploading }, ref) => {
  const snapPoints = ['40%'];

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={({ style }) => (
        <View style={[style, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
      )}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Select Image Source</Text>

        {/* Take Photo */}
        <TouchableOpacity
          style={[styles.option, isUploading && styles.disabledOption]}
          onPress={onTakePhoto}
          disabled={isUploading}
        >
          <Ionicons name="camera-outline" size={28} color="#007AFF" />
          <Text style={styles.optionText}>Take Photo</Text>
          {isUploading && <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 10 }} />}
        </TouchableOpacity>

        {/* Choose from Gallery */}
        <TouchableOpacity
          style={[styles.option, isUploading && styles.disabledOption]}
          onPress={onPickImage}
          disabled={isUploading}
        >
          <Ionicons name="images-outline" size={28} color="#007AFF" />
          <Text style={styles.optionText}>Choose from Gallery</Text>
          {isUploading && <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 10 }} />}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => ref.current?.close()}
          disabled={isUploading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
  },
  title: {
    fontSize: hp(2.6),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp(3),
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: hp(2.4),
    paddingHorizontal: wp(5),
    borderRadius: 16,
    marginBottom: hp(1.8),
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: hp(2.2),
    color: '#333',
    marginLeft: wp(4),
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    marginTop: hp(1),
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  cancelText: {
    fontSize: hp(2.1),
    color: '#666',
    fontWeight: '500',
  },
});

export default ImageSourceSheet;