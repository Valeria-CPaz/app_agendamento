import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { formatCPF, formatPhone } from "../../utils/formatters";
import { getPatientById, removePatient } from "../../services/patientService";
import { theme } from "../../theme/theme";
import { Patient } from "../../types/patient";
import { UserPen } from "lucide-react-native";

export default function PatientDetailScreen() {
    const { id } = useLocalSearchParams();
    const patientId = Array.isArray(id) ? id[0] : (id ?? "");

    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [notFound, setNotFound] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (!patientId) {
                setPatient(null);
                setNotFound(true);
                return;
            }

            let active = true;

            (async () => {
                try {
                    const data = await getPatientById(patientId);
                    if (!active) return;
                    if (data) {
                        setPatient(data);
                        setNotFound(false);
                    } else {
                        setPatient(null);
                        setNotFound(true);
                    }
                } catch (err) {
                    if (!active) return;
                    setPatient(null);
                    setNotFound(true);
                    Toast.show({
                        type: "error",
                        text1: "Erro ao carregar paciente",
                        text2: "Tente novamente em instantes.",
                    });
                }
            })();

            return () => {
                active = false;
            };
        }, [patientId])
    );

    async function confirmDelete() {
        if (!patient) return;
        Alert.alert(
            "Excluir paciente",
            `Tem certeza que deseja excluir "${patient.name}"?`,
            [
                { text: "Não", style: "cancel" },
                {
                    text: "Sim",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removePatient(patient.id);
                            Toast.show({ type: "success", text1: "Paciente excluído!" });
                            router.back(); // volta para a lista
                        } catch {
                            Toast.show({
                                type: "error",
                                text1: "Falha ao excluir",
                                text2: "Verifique sua conexão e tente novamente.",
                            });
                        }
                    },
                },
            ]
        );
    }

    function handleEdit() {
        if (!patient) return;
        router.push({ pathname: "/edit-patient/[id]", params: { id: patient.id } });
    }

    if (!patient && !notFound) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Carregando paciente...</Text>
            </View>
        );
    }

    if (notFound) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Paciente não encontrado</Text>
                <Text style={styles.value}>
                    Verifique o ID e tente novamente.
                </Text>
            </View>
        );
    }

    // patient garantido aqui
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {patient!.name} {patient!.lastName}
            </Text>

            <View style={styles.infoBlock}>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{formatPhone(patient!.phone)}</Text>
            </View>

            {patient!.email ? (
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>E-mail:</Text>
                    <Text style={styles.value}>{(patient!.email || "").toLowerCase()}</Text>
                </View>
            ) : null}

            {patient!.cpf ? (
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>CPF:</Text>
                    <Text style={styles.value}>{formatCPF(patient!.cpf)}</Text>
                </View>
            ) : null}

            <View style={styles.infoBlock}>
                <Text style={styles.label}>Valor da sessão:</Text>
                <Text style={styles.value}>
                    R$ {patient!.sessionValue}{" "}
                    {patient!.isSocial ? "(Valor social)" : "(valor integral)"}
                </Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <View style={styles.editButtonContent}>
                    <UserPen size={20} color={theme.surface} />
                    <Text style={styles.editButtonText}>Editar</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Excluir paciente</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: theme.background },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: theme.primary,
        marginBottom: 22,
    },
    infoBlock: {
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontWeight: "bold",
        marginRight: 8,
        color: theme.text,
        fontSize: 16,
    },
    value: {
        color: theme.textLight,
        fontSize: 16,
    },
    editButton: {
        backgroundColor: theme.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
    },
    editButtonText: {
        color: theme.surface,
        fontWeight: "bold",
        fontSize: 16,
    },
    editButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    deleteButton: {
        backgroundColor: theme.error,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
    },
    deleteButtonText: {
        color: theme.surface,
        fontWeight: "bold",
        fontSize: 16,
    },
    deleteButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
