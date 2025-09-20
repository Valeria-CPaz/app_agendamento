import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getAllPatients } from "../../services/patientService";
import { theme } from "../../theme/theme";
import { Patient } from "../../types/patient";
import { capitalize, formatPhone } from "@/utils/formatters";
import { UserPen } from 'lucide-react-native';

export default function PatientsScreen() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [query, setQuery] = useState("");
    const router = useRouter(); // expo-router hook for navigation

    // Load patients whenever this screen gains focus
    useFocusEffect(
        useCallback(() => {
            let active = true;

            (async () => {
                try {
                    const data = await getAllPatients();
                    if (active) setPatients(data ?? []);
                } catch (e) {
                    console.log(e);
                    if (active) setPatients([]);
                }
            })();

            return () => {
                active = false;
            };
        }, [])
    );

    // Helper: normalize strings to ignore case and diacritics (accents)
    const normalize = (s: string) =>
        (s || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    // Memoized filtered list based on query
    const filtered = useMemo(() => {
        const q = normalize(query);
        if (!q) return patients;
        return patients.filter((p) => normalize(p.name).includes(q));
    }, [patients, query]);

    const showEmpty =
        (patients.length === 0 && filtered.length === 0) ||
        (patients.length > 0 && filtered.length === 0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pacientes</Text>

            {/* Search input */}
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nome"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="words"
                    placeholderTextColor={theme.textLight}
                />
                {query.length > 0 && (
                    <Pressable
                        onPress={() => setQuery("")}
                        style={styles.clearBtn}
                        android_ripple={{ color: "#00000011", borderless: true }}
                    >
                        <Text style={styles.clearTxt}>✕</Text>
                    </Pressable>
                )}
            </View>

            {/* Add button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/add-patient")}
            >
                <Text style={styles.addButtonText}>Adicionar Paciente</Text>
            </TouchableOpacity>

            {/* List patients */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: "/patient/[id]",
                                params: { id: item.id },
                            })
                        }
                    >
                        <Text style={styles.name}>{capitalize(item.name)} {capitalize(item.lastName)}</Text>
                        {item.phone ? (
                            <Text style={styles.info}>{formatPhone(item.phone)}</Text>
                        ) : null}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    showEmpty ? (
                        <Text style={styles.empty}>
                            {patients.length === 0
                                ? "Nenhum paciente encontrado."
                                : `Nenhum resultado para "${query}".`}
                        </Text>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.background,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
        color: theme.primary,
    },

    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.surface,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },

    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: theme.text,
    },

    clearBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
    },

    clearTxt: {
        fontSize: 16,
        color: theme.textLight,
    },

    addButton: {
        backgroundColor: theme.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },

    addButtonText: {
        color: theme.surface,
        fontWeight: "bold",
        fontSize: 18,
    },

    card: {
        //padding: 6,
        borderRadius: 10,
        backgroundColor: theme.surface,
        marginBottom: 7,
        borderWidth: 1,
        borderColor: theme.border,
    },

    name: {
        fontSize: 18,
        marginTop: 7,
        marginLeft: 12,
        marginBottom: -10,
        padding: 0,
        fontWeight: "bold",
        color: theme.text,
    },

    info: {
        fontSize: 12,
        color: theme.textLight,
        alignSelf: "flex-end",
        marginTop: -10,
        marginRight: 12,
        marginBottom: 10,
        padding: 0,
    },

    empty:
    {
        marginTop: 40,
        textAlign: "center",
        color: theme.textLight
    },
});