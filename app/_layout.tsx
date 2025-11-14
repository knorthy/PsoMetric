// app/(tabs)/_layout.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1A73E8",
      }}
    >
      <Tabs.Screen
        name="assessment"
        options={{
          title: "Assess",
          tabBarIcon: ({ color }) => <MaterialIcons name="assessment" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: "Result",
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="theme"
        options={{
          title: "Theme",
          tabBarIcon: ({ color }) => <MaterialIcons name="palette" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}