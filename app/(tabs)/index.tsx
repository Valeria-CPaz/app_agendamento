import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="patients" options={{ title: "Patients" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}