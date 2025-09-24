import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Aqui você poderá ajustar preferências do app e seus dados pessoais.</Text>
      {/* Adicione campos e botões aqui depois */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: theme.primary, marginBottom: 8 },
  subtitle: { color: theme.textLight, marginBottom: 16 },
});
