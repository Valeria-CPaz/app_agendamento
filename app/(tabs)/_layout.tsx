import AppHeader from '@/components/AppHeader';
import { Tabs, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CalendarRange, ClipboardMinus, Contact, LogOut, Settings } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import Toast from "react-native-toast-message";
import { useTheme } from "../../context/ThemeContext";


export default function TabLayout() {
  const pathname = usePathname();

  // Themes
  const theme = useTheme();

  const headerTitle = React.useMemo(() => {
    if (!pathname) return "Psico App";
    if (pathname.includes("/patients")) return "Pacientes";
    if (pathname.includes("/schedule")) return "Agenda";
    if (pathname.includes("/reports")) return "Relatórios";
    if (pathname.includes("/settings")) return "Configurações";
    return "Psico App";

  }, [pathname]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={theme.background} />
      <AppHeader
        title={headerTitle}
        rightComponent={
          <Pressable onPress={() => alert("Logout")}>
            <LogOut color={theme.secondary} />
          </Pressable>
        }
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.border,
          tabBarInactiveTintColor: theme.secondary,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="patients"
          options={{
            title: 'Pacientes',
            tabBarIcon: ({ color, size }) => <Contact color={color} size={size} />
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => <CalendarRange color={color} size={size} />
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ color, size }) => <ClipboardMinus color={color} size={size} />
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
          }}
        />
      </Tabs>
      <Toast />
    </View>
  );
}