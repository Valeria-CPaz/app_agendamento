import { loadSettings, resetSettings, saveSettings } from "@/services/settingsService";
import { UserSettings } from "@/types/settings";
import { Save, X } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import { useSetThemeName, useTheme, useThemeName } from "../../context/ThemeContext";


export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    fullPrice: 0,
    theme: "light",
    fingerprintEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  // Theme light (default)
  const theme = useTheme();
  const themeName = useThemeName();
  const setThemeName = useSetThemeName();

  useEffect(() => {
    loadSettings().then((loaded) => {
      if (loaded) setSettings(loaded);
      setLoading(false);
    });
  }, []);

  function handleChange(key: keyof UserSettings, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!settings.name || !settings.lastName || !settings.email || !settings.fullPrice) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    await saveSettings({ ...settings, theme: themeName });
    Toast.show({ type: "success", text1: "Configurações salvas!", position: "bottom" });
  }

  async function handleReset() {
    await resetSettings();
    setSettings({
      name: "",
      lastName: "",
      email: "",
      password: "",
      fullPrice: 0,
      theme: "light",
      fingerprintEnabled: false,
    });
  }

  if (loading) return <Text>Carregando...</Text>;


  const styles = StyleSheet.create({
    container: {
      flex: 1, padding: 16,
      backgroundColor: theme.background,
      marginTop: 70
    },
    label: {
      color: theme.text,
      fontSize: 18,
      marginBottom: 4,
      marginTop: 12,
      marginLeft: 5,
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 8,
      marginLeft: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      fontSize: 16,
      color: theme.text
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 8,
      justifyContent: "space-between"
    },
    button: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.secondary,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: {
      color: theme.surface,
      fontWeight: "bold",
      fontSize: 18,
      marginLeft: 5
    },
    buttonItems: {
      flexDirection: "row",
      alignItems: "center"

    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meus Dados:</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={settings.name}
        onChangeText={v => handleChange("name", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Sobrenome"
        value={settings.lastName}
        onChangeText={v => handleChange("lastName", v)}
      />

      <TextInput
        style={styles.input}
        value={settings.email}
        placeholder="E-mail"
        onChangeText={v => handleChange("email", v)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={settings.password}
        onChangeText={v => handleChange("password", v)}
        secureTextEntry
      />

      <Text style={styles.label}>Valor Integral</Text>
      <TextInput
        style={styles.input}
        value={settings.fullPrice ? settings.fullPrice.toString() : ""}
        onChangeText={v => handleChange("fullPrice", Number(v.replace(/\D/g, "")))}
        keyboardType="numeric"
        placeholder="R$ 0,00"
      />

      <View style={styles.row}>
        <Text style={styles.label}>Tema escuro?</Text>
        <Switch
          trackColor={{ false: theme.surface, true: theme.accent }}
          thumbColor={theme.primary}
          value={themeName === "dark"}
          onValueChange={v => setThemeName(v ? "dark" : "light")}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Fingerprint?</Text>
        <Switch
          trackColor={{ false: theme.surface, true: theme.accent }}
          thumbColor={theme.primary}
          value={settings.fingerprintEnabled}
          onValueChange={v => handleChange("fingerprintEnabled", v)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <View style={styles.buttonItems}>
          <Save size={25} color={theme.surface} />
          <Text style={styles.buttonText}>Salvar</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.error }]} onPress={handleReset}>
        <View style={styles.buttonItems}>
          <X size={25} color={theme.surface} />
          <Text style={styles.buttonText}>Resetar</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

}
