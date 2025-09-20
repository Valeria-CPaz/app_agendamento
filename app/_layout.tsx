import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from "react-native-toast-message";
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { theme } from "../theme/theme"


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.primary },
          headerTintColor: theme.primary,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="patient/[id]"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="add-patient/[id]"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="edit-patient/[id]"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
