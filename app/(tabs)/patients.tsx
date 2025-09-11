import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { getAllPatients } from "../services/patientService";
import { Patient } from "../types/patient";

export default function PatientsScreen() {
    const [patients, setPatients] = useState<Patient[]>([]);

    // Load patients
    useEffect(() => {
        loadPatients();
    }, []);

    async function loadPatients() {
        const data = await getAllPatients();
        setPatients(data);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pacientes</Text>

            {/* List patients */}
            <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.info}>{item.email}</Text>
                        <Text style={styles.info}>{item.phone}</Text>
                        <Text style={styles.info}>
                            Session: R$ {item.sessionValue} | {item.isSocial ? "Plano Social" : "Preço Cheio"}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum paciente encontrado.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
    card: { padding: 16, borderRadius: 10, backgroundColor: "#f5f6fa", marginBottom: 12 },
    name: { fontSize: 18, fontWeight: "bold" },
    info: { color: "#555", marginTop: 2 },
    empty: { marginTop: 40, textAlign: "center", color: "#aaa" },
});