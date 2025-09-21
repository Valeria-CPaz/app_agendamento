import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Appointment } from "@/types/appointment";
import { getAppointmentById, deleteAppointment } from "@/services/appointmentService";

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
            "Delete appointment",
            `Are you sure you want to delete the session with "${item.patientName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteAppointment(item.id);
                        Alert.alert("Deleted", "Appointment removed.");
                        router.back();
                    },
                },
            ]
        );
    }

    function handleEdit() {
        if (!item) return;
        router.push({
            pathname: "/schedule/new", params: { ...item, price: String(item.price ?? ""), edit: "1" }
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.title}>
                {item.patientName} ({item.date})
            </Text>
            <Text style={styles.info}>
                {item.start} – {item.end}
            </Text>
            {item.price ? <Text style={styles.info}>Price: R$ {item.price}</Text> : null}
            {item.notes ? <Text style={styles.info}>Notes: {item.notes}</Text> : null}
            <Text style={styles.info}>Status: {item.status}</Text>

            <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <Text style={styles.editTxt}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteTxt}>Delete</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", color: theme.primary, marginBottom: 12 },
    info: { fontSize: 16, color: theme.text, marginBottom: 8 },

    editBtn: {
        backgroundColor: theme.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 16,
    },
    editTxt: { color: theme.surface, fontWeight: "bold" },

    deleteBtn: {
        backgroundColor: theme.error,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
    },
    deleteTxt: { color: theme.surface, fontWeight: "bold" },
});
