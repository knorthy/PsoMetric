import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="assess" />
      <Stack.Screen name="photoguide" />
      <Stack.Screen name="camera-welcome" />
      <Stack.Screen name="result" />
      <Stack.Screen name="viewprofile" />
    </Stack>
  );
}
