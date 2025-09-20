import { Tabs, Stack } from 'expo-router';
import React from 'react';
import Toast from "react-native-toast-message";
import { theme } from '../../theme/theme';
import { Contact, ClipboardMinus, CalendarRange, Settings } from 'lucide-react-native';


export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,        // Aba ativa = azul petróleo
          tabBarInactiveTintColor: theme.border,    // Abas inativas = cinza intermediário
          tabBarStyle: {
            backgroundColor: theme.surface,            // Fundo claro
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',                         // Deixa o nome da aba mais visível
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
    </>
  );
}