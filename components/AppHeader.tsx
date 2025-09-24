import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const APP_HEADER_HEIGHT = 56;

type AppHeaderProps = {
  title?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
};

import { theme } from "@/theme/theme";

export default function AppHeader({ title = "Psico App", rightComponent, leftComponent }: AppHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.side}>{leftComponent}</View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.side}>{rightComponent}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.background, 
    zIndex: 100,
  },
  header: {
    height: 56,
    backgroundColor: theme.background, 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: theme.secondary,
    fontSize: 22,
    fontWeight: "bold",
  },
  side: {
    width: 40,
    alignItems: "center",
  },
});
