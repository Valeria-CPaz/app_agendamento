import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from "react-native-toast-message";
import { useTheme, ThemeProvider } from "../context/ThemeContext";


export default function RootLayout() {
  // Themes
  const theme = useTheme();

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.surface },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="patient/[id]/index"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="patient/new"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="patient/[id]/edit"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="schedule/new"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />
        <Stack.Screen
          name="schedule/[id]"
          options={{
            title: "",
            headerBackTitle: "Voltar",
          }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" backgroundColor={theme.background} />
      <Toast />
    </ThemeProvider>
  );
}
