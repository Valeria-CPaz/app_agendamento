import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import Toast from "react-native-toast-message";
import { Appointment } from "@/types/appointment";
import { getAppointmentById, deleteAppointment } from "@/services/appointmentService";
import { Trash2, Pencil } from 'lucide-react-native';

export default function ScheduleDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [item, setItem] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);

    // Load appointment on focus
    useFocusEffect(
        useCallback(() => {
            if (!id) return;
            let active = true;
            (async () => {
                try {
                    setLoading(true);
                    const data = await getAppointmentById(id);
                    if (active) setItem(data ?? null);
                } finally {
                    if (active) setLoading(false);
                }
            })();
            return () => {
                active = false;
            };
        }, [id])
    );

    function handleDelete() {
        if (!item) return;
        Alert.alert(
            "Deletar agendamento",
            `Tem certeza que deseja deletar agendamento com "${item.patientName}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Deletar",
                    style: "destructive",
                    onPress: async () => {
                        await deleteAppointment(item.id);
                        Toast.show({
                            type: "success",
                            text1: "Agendamento deletado ✅",
                            position: "bottom"
                        })
                        router.back();
                    },
                },
            ]
        );
    }

    function handleEdit() {
        if (!item) return;
        router.push({
            pathname: "/schedule/new",
            params: {
                ...item,
                price: String(item.price ?? ""),
                sessionValue: String(item.sessionValue ?? ""),
                isSocial: item.isSocial ? "1" : "0",   
                edit: "1",
            }
        });
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    if (!item) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Appointment not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} >
            <Text style={styles.title}>
                {item.patientName} ({item.date})
            </Text>
            <View style={styles.detailsCard}>
                <Text style={styles.info}>
                    {item.start} – {item.end}
                </Text>
                {item.price ? <Text style={styles.info}>Price: R$ {item.price}</Text> : null}
                {item.notes ? <Text style={styles.info}>Notes: {item.notes}</Text> : null}
                <Text style={styles.info}>Status: {item.status}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <View style={styles.buttonItems}>
                    <Pencil size={25} color={theme.surface} />
                    <Text style={styles.editTxt}>EDITAR</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <View style={styles.buttonItems}>
                    <Trash2 size={25} color={theme.surface} />
                    <Text style={styles.deleteTxt}>DELETAR</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: theme.textLight, marginBottom: 12 },
    info: { fontSize: 16, color: theme.text, marginBottom: 4 },

    editBtn: {
        backgroundColor: theme.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        alignItems: "center",
        marginTop: 16,
        borderColor: theme.secondary,
    },
    editTxt: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 10 },

    deleteBtn: {
        backgroundColor: theme.error,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        alignItems: "center",
        marginTop: 10,
        borderColor: theme.secondary,
    },
    deleteTxt: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 10 },

    buttonItems: {
        flexDirection: "row",
        alignItems: "center"
    },

    detailsCard: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 16,
    },
});

