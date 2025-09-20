import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "../../theme/theme";
import { AppointmentStatus } from "@/types/appointment";


export default function ScheduleNewScreen() {
    const router = useRouter();
    const { date, start, end, patientId } = useLocalSearchParams<{
        date?: string;
        start?: string;
        end?: string;
        patientId?: string;
    }>();

    const [form, setForm] = useState({
        patientId: patientId ?? "",
        patientName: "",
        date: date ?? "",
        start: start ?? "",
        end: end ?? "",
        status: "confirmed" as AppointmentStatus,
        price: "",
        notes: "",
    });

    const canSave = useMemo(() => {
        return form.patientId.trim().length > 0 && form.date && form.start && form.end;
    }, [form]);

    function handleChange<K extends keyof typeof form>(key: K, value: string) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSave() {
        if (!canSave) {
            Alert.alert("Campos obrigatórios", "Preencha paciente, data, início e fim.");
            return;
        }

        Alert.alert("Agendamento", "Sessão criada (placeholder).");
        router.back();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Novo agendamento</Text>

            <Text style={styles.label}>Paciente (ID)</Text>
            <TextInput
                style={styles.input}
                placeholder="patientId"
                placeholderTextColor={theme.textLight}
                value={form.patientId}
                onChangeText={(v) => handleChange("patientId", v)}
            />

            <Text style={styles.label}>Nome do paciente (opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex.: Maria Souza"
                placeholderTextColor={theme.textLight}
                value={form.patientName}
                onChangeText={(v) => handleChange("patientName", v)}
            />

            <Text style={styles.label}>Data (DD-MM-YYYY)</Text>
            <TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                placeholderTextColor={theme.textLight}
                value={form.date}
                onChangeText={(v) => handleChange("date", v)}
            />

            <Text style={styles.label}>Início (HH:mm)</Text>
            <TextInput
                style={styles.input}
                placeholder="07:00"
                placeholderTextColor={theme.textLight}
                value={form.start}
                onChangeText={(v) => handleChange("start", v)}
            />

            <Text style={styles.label}>Fim (HH:mm)</Text>
            <TextInput
                style={styles.input}
                placeholder="08:00"
                placeholderTextColor={theme.textLight}
                value={form.end}
                onChangeText={(v) => handleChange("end", v)}
            />

            <Text style={styles.label}>Preço (opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex.: 120"
                placeholderTextColor={theme.textLight}
                keyboardType="numeric"
                value={form.price}
                onChangeText={(v) => handleChange("price", v)}
            />

            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Notas da sessão…"
                placeholderTextColor={theme.textLight}
                value={form.notes}
                onChangeText={(v) => handleChange("notes", v)}
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity
                style={[styles.saveBtn, !canSave && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!canSave}
            >
                <Text style={styles.saveTxt}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", color: theme.primary, marginBottom: 12 },

    label: { color: theme.text, fontSize: 12, marginTop: 10, marginBottom: 6 },
    input: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.text,
    },
    textarea: { minHeight: 100, textAlignVertical: "top" },

    saveBtn: {
        marginTop: 16,
        backgroundColor: theme.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
    },
    saveTxt: { color: theme.surface, fontWeight: "bold" },

    cancelBtn: {
        marginTop: 10,
        backgroundColor: theme.surface,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
    },
    cancelTxt: { color: theme.text, fontWeight: "600" },
});
