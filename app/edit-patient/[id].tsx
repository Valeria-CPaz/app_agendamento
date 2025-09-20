import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet,Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { updatePatient, getPatientById } from "../../services/patientService";
import { theme } from "../../theme/theme";
import { Patient } from "../../types/patient";
import PatientForm from "@/components/PatientForm";


export default function EditPatientScreen() {
    const { id } = useLocalSearchParams();
    const patientId = Array.isArray(id) ? id[0] : (id ?? "");
    const router = useRouter();

    const [patient, setPatient] = useState<Patient | null>(null);

    useEffect(() => {
        async function loadPatient() {
            const found = await getPatientById(patientId);
            if (found) setPatient(found);
        }
        loadPatient();
    }, [patientId]);

    async function handleUpdate(updated: Patient) {
        await updatePatient(updated);
        Toast.show({ type: "success", text1: "Paciente atualizado com sucesso!" });
        setTimeout(() => router.back(), 800);
    }

    if (!patient) return <Text>Carregando...</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Paciente</Text>
            <PatientForm
                mode="edit"
                initialValues={patient}
                onSubmit={handleUpdate}
                onCancel={() => router.back()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: theme.background },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: theme.primary },
    input: {
        borderWidth: 1,
        borderColor: theme.surface,
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
    switchLabel: { marginRight: 10, color: theme.text },
    saveButton: {
        backgroundColor: theme.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
        alignSelf: "center",
        width: "100%",
    },
    saveButtonText: {
        color: theme.surface,
        fontWeight: "bold",
        fontSize: 18,
    },
    deleteButton: {
        backgroundColor: theme.error,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
    },
    deleteButtonText: {
        color: theme.surface,
        fontWeight: "bold",
        fontSize: 18,
    },
    editButtonContent: {
        flexDirection: "row", // icon + text side by side
        alignItems: "center",
        gap: 8,
        marginBottom: 15,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
});