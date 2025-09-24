import { useTheme } from "@/context/ThemeContext";
import { Save, X } from 'lucide-react-native';
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Patient } from "../types/patient";
import { formatPhone, isValidCPF, isValidEmail, isValidPhone } from "../utils/formatters";



type PatientFormProps = {
    initialValues?: Partial<Patient>;               // Pre-filled values when editing
    onSubmit: (patient: Patient) => void;           // Callback for save
    onCancel?: () => void;                          // Optional cancel
    mode: "create" | "edit";                        // To customize texts
};

const valorIntegralDosSettings = 15000;

function formatMoneyBR(value: string | number): string {
    const numeric = String(value).replace(/\D/g, "");
    if (!numeric) return "R$ 0,00";
    let int = numeric.slice(0, -2) || "0";
    let cents = numeric.slice(-2).padStart(2, "0");
    int = parseInt(int, 10).toLocaleString("pt-BR");
    return `R$ ${int},${cents}`;
}

export default function PatientForm({ initialValues = {}, onSubmit, onCancel, mode }: PatientFormProps) {
    const [name, setName] = useState(initialValues.name || "");
    const [lastName, setLastName] = useState(initialValues.lastName || "");
    const [cpf, setCpf] = useState(initialValues.cpf || "");
    const [email, setEmail] = useState(initialValues.email || "");
    const [phone, setPhone] = useState(initialValues.phone || "");
    const [sessionValue, setSessionValue] = useState(initialValues.sessionValue?.toString() || "");
    const [isSocial, setIsSocial] = useState(initialValues.isSocial || false);

    // Themes
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        input: {
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 16,
            color: theme.text,
        },
        switchRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
            gap: 12,
        },
        switchLabel: { color: theme.text, fontSize: 16, marginLeft: 5 },
        saveButton: {
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.secondary,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
        },
        saveButtonText: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 5 },
        cancelButton: {
            backgroundColor: theme.error,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.secondary,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 10,
        },
        cancelButtonText: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 5 },
        buttonItems: {
            flexDirection: "row",
            alignItems: "center"

        },
    });

    // Validation and submit handler
    function handleSubmit() {
        const cleanedEmail = email.trim().toLowerCase();
        const valorFinal = isSocial ? Number(sessionValue) / 100 : valorIntegralDosSettings / 100;


        if (cleanedEmail && !isValidEmail(cleanedEmail)) {
            Toast.show({ type: "error", text1: "E-mail inválido!", position: "bottom" });
            return;
        }
        if (cpf && !isValidCPF(cpf)) {
            Toast.show({ type: "error", text1: "CPF inválido!", position: "bottom" });
            return;
        }
        if (!isValidPhone(phone)) {
            Toast.show({ type: "error", text1: "Telefone inválido! Preencha o DDD e o número completo.", position: "bottom" });
            return;
        }
        if (!name || !lastName || !phone || (isSocial && !sessionValue)) {
            Toast.show({ type: "error", text1: "Preencha nome, sobrenome, telefone e valor!", position: "bottom" })
            return;
        }

        const patient: Patient = {
            id: initialValues.id || Math.random().toString(36).substring(2, 12) + Date.now(), // keep id if editing
            name,
            lastName,
            cpf,
            email: cleanedEmail,
            phone,
            sessionValue: valorFinal,
            isSocial,
        };

        onSubmit(patient);
    }

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={60}
        >

            <ScrollView style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Sobrenome"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="CPF (opcional)"
                    value={cpf}
                    onChangeText={setCpf}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email (opcional)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Telefone"
                    value={formatPhone(phone)}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <View style={{ marginBottom: 18 }}>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Valor social?</Text>
                        <Switch
                            value={isSocial}
                            onValueChange={setIsSocial}
                            trackColor={{ false: theme.surface, true: theme.accent }}
                            thumbColor={theme.primary}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        value={
                            isSocial
                                ? formatMoneyBR(sessionValue)
                                : formatMoneyBR(valorIntegralDosSettings)
                        }
                        onChangeText={text => setSessionValue(text.replace(/\D/g, ""))}
                        keyboardType="numeric"
                        editable={isSocial}
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <View style={styles.buttonItems}>
                        <Save size={25} color={theme.surface} />
                        <Text style={styles.saveButtonText}>
                            {mode === "create" ? "Salvar Paciente" : "Salvar Alterações"}
                        </Text>
                    </View>
                </TouchableOpacity>

                {onCancel && (
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <View style={styles.buttonItems}>
                            <X size={25} color={theme.surface} />
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

