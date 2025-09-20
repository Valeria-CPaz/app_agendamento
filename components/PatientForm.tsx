import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, Switch, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { Patient } from "../types/patient";
import { theme } from "../theme/theme";
import { isValidCPF, isValidEmail, isValidPhone } from "../utils/formatters";

type PatientFormProps = {
    initialValues?: Partial<Patient>;               // Pre-filled values when editing
    onSubmit: (patient: Patient) => void;           // Callback for save
    onCancel?: () => void;                          // Optional cancel
    mode: "create" | "edit";                        // To customize texts
};

export default function PatientForm({ initialValues = {}, onSubmit, onCancel, mode }: PatientFormProps) {
    const [name, setName] = useState(initialValues.name || "");
    const [lastName, setLastName] = useState(initialValues.lastName || "");
    const [cpf, setCpf] = useState(initialValues.cpf || "");
    const [email, setEmail] = useState(initialValues.email || "");
    const [phone, setPhone] = useState(initialValues.phone || "");
    const [sessionValue, setSessionValue] = useState(initialValues.sessionValue?.toString() || "");
    const [isSocial, setIsSocial] = useState(initialValues.isSocial || false);

    // Validation and submit handler
    function handleSubmit() {
        const cleanedEmail = email.trim().toLowerCase();

        if (cleanedEmail && !isValidEmail(cleanedEmail)) {
            Toast.show({ type: "error", text1: "E-mail inválido!" });
            return;
        }
        if (cpf && !isValidCPF(cpf)) {
            Toast.show({ type: "error", text1: "CPF inválido!" });
            return;
        }
        if (!isValidPhone(phone)) {
            Toast.show({ type: "error", text1: "Telefone inválido! Preencha o DDD e o número completo." });
            return;
        }
        if (!name || !lastName || !phone || !sessionValue) {
            Toast.show({ type: "error", text1: "Preencha nome, sobrenome, telefone e valor!" })
            return;
        }

        const patient: Patient = {
            id: initialValues.id || Math.random().toString(36).substring(2, 12) + Date.now(), // keep id if editing
            name,
            lastName,
            cpf,
            email: cleanedEmail,
            phone,
            sessionValue: Number(sessionValue),
            isSocial,
        };

        onSubmit(patient);
    }

    return (
        <View>
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
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                placeholder="Valor da Sessão"
                value={sessionValue}
                onChangeText={setSessionValue}
                keyboardType="numeric"
            />
            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Valor social?</Text>
                <Switch
                    value={isSocial}
                    onValueChange={setIsSocial}
                    trackColor={{ false: theme.border, true: "#ECD385" }}
                    thumbColor={"#FFFFFF"}
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>
                    {mode === "create" ? "Salvar paciente" : "Salvar alterações"}
                </Text>
            </TouchableOpacity>

            {onCancel && (
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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
    switchLabel: { color: theme.text },
    saveButton: {
        backgroundColor: theme.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonText: { color: theme.surface, fontWeight: "bold", fontSize: 18 },
    cancelButton: {
        backgroundColor: theme.error,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
    },
    cancelButtonText: { color: theme.surface, fontWeight: "bold", fontSize: 18 },
});