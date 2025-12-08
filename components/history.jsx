import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 290;

const PLACEHOLDER_ASSESSMENTS = [];

export default function History({
  visible = false,
  onClose,                  
  onSelectAssessment = () => {},
  assessments = [],
}) {
  const router = useRouter(); 
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  
  // Memoize assessments to prevent unnecessary re-renders
  const memoizedAssessments = useMemo(() => assessments, [JSON.stringify(assessments)]);
  
  useEffect(() => {
  if (!visible) {
    setSearchQuery('');
  }
}, [visible]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -SIDEBAR_WIDTH,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssessments(memoizedAssessments);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAssessments(
        memoizedAssessments.filter((item) =>
          item.title?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, memoizedAssessments]);

  if (!visible && slideAnim._value <= -SIDEBAR_WIDTH + 10) return null;

  const handleItemPress = (item) => {
    onSelectAssessment?.(item);
    setSearchQuery('');
  };

  const clearSearch = () => setSearchQuery('');

 
const handleAssessNew = () => {
  onClose(); 
  router.push('/home');
};

  return (
    <>
    {/* Dark Overlay */}
{visible && (
  <TouchableOpacity
    activeOpacity={1}
    onPress={onClose}
    style={[
      StyleSheet.absoluteFillObject,
      { paddingLeft: SIDEBAR_WIDTH } 
    ]}
  >
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        opacity: slideAnim.interpolate({
          inputRange: [-SIDEBAR_WIDTH, 0],
          outputRange: [0, 0.5],
        }),
      }}
    />
  </TouchableOpacity>
)}

      {/* Sidebar */}
      <Animated.View
  style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
  pointerEvents={visible ? 'auto' : 'none'}
  onStartShouldSetResponder={() => true}  
  onResponderGrant={(e) => e.stopPropagation()} 
>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for assessments"
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="never"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>

            {/*  Assess New Symptoms */}
            <TouchableOpacity style={styles.assessNewRow} onPress={handleAssessNew}>
              <View style={styles.plusIconCircle}>
                <Ionicons name="add" size={20} color="#007AFF" />
              </View>
              <Text style={styles.assessNewText}>Assess new symptoms</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.recentLabel}>
            {searchQuery
              ? `Results (${filteredAssessments.length})`
              : assessments.length > 0
              ? 'Recent'
              : 'No assessments yet'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {filteredAssessments.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  {searchQuery
                    ? 'No assessments found'
                    : 'You haven’t completed any assessments yet'}
                </Text>
              </View>
            ) : (
              filteredAssessments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.historyItemWrapper,
                    item.active && styles.activeItemWrapper,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleItemPress(item)}
                >
                  <Text
                    style={[
                      styles.historyText,
                      item.active && styles.activeHistoryText,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
}

/* Styles */
const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 9999,
  },

  content: {
    flex: 1,
    backgroundColor: '#FCFCFD',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
  },

  headerSection: {
    paddingTop: 56,
    paddingHorizontal: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },

  assessNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },

  plusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  assessNewText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },

  recentLabel: {
    marginLeft: 20,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D6D',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  historyItemWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 28,
  },

  activeItemWrapper: {
    backgroundColor: '#BFD8FF',
  },

  historyText: {
    fontSize: 16,
    color: '#7A7A7A',
    fontWeight: '500',
  },

  activeHistoryText: {
    color: '#4A4A4A',
    fontWeight: '600',
  },

  noResults: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  noResultsText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});