import PatientForm from "@/components/PatientForm";
import { addPatient } from "@/services/patientService";
import { Patient } from "@/types/patient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../context/ThemeContext";


export default function AddPatientScreen() {
    const router = useRouter();
    // Themes
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: { flex: 1, padding: 20, backgroundColor: theme.background },
        title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: theme.primary, marginLeft: 10 },
    });


    async function handleCreate(newPatient: Patient) {
        await addPatient(newPatient);
        Toast.show({ type: "success", text1: "Paciente cadastrado com sucesso!", position: "bottom" });
        setTimeout(() => router.back(), 800);
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adicionar Paciente</Text>
            <PatientForm mode="create" onSubmit={handleCreate} onCancel={() => router.back()} />
        </View>
    );
}




