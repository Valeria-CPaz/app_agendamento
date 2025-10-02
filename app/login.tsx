import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "@/context/ThemeContext";
import { loadSettings } from "@/services/settingsService";
import { useRouter } from "expo-router";


export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.background,
            padding: 24
        },
        title: {
            fontSize: 28,
            fontWeight: "bold",
            color: theme.primary,
            marginBottom: 32
        },
        input: {
            width: "100%",
            maxWidth: 340,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 10,
            backgroundColor: theme.surface,
            color: theme.text,
            fontSize: 16, padding: 14,
            marginBottom: 18
        },
        button: {
            backgroundColor: theme.primary,
            borderRadius: 10,
            paddingVertical: 14,
            width: "100%",
            maxWidth: 340,
            alignItems: "center"
        },
        buttonText: {
            color: theme.surface,
            fontSize: 18,
            fontWeight: "bold"
        }
    });


    async function handleLogin() {
        setLoading(true);
        try {
            const settings = await loadSettings();
            if (!settings || !settings.email || !settings.password) {
                Toast.show({ type: "error", text1: "Usuário não cadastrado ainda.", position: "bottom" });
                setLoading(false);
                return;
            }
            if (email.trim() === settings.email && password === settings.password) {
                Toast.show({ type: "success", text1: "Bem-vinda(o) de volta!" });
                router.replace("./(tabs)/patients");
            } else {
                Toast.show({ type: "error", text1: "E-mail ou senha inválidos.", position: "bottom" });
            }
        } catch (err) {
            Toast.show({ type: "error", text1: "Erro ao fazer login.", text2: String(err), position: "bottom" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PsicoApp 𝚿 Login</Text>
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
            </TouchableOpacity>
        </View>
    );
}

