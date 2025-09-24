import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, Pressable, Keyboard } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { createAppointment, getAppointmentById, updateAppointment } from "@/services/appointmentService";
import { getAllPatients } from "@/services/patientService";
import { Picker } from "@react-native-picker/picker";
import { UserSearch, Save, X } from 'lucide-react-native';
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Patient } from "@/types/patient";


const STATUS_OPTIONS: { label: string; value: AppointmentStatus }[] = [
    { label: "Confirmado", value: "confirmado" },
    { label: "Pendente", value: "pendente" },
    { label: "Cancelado", value: "cancelado" },
    { label: "Faltou", value: "faltou" },
];


export default function ScheduleNewScreen() {
    const router = useRouter();
    const { date, start, end, id, edit } = useLocalSearchParams<{
        date?: string;
        start?: string;
        end?: string;
        id?: string;
        edit?: string;
    }>();

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);

    const [form, setForm] = useState({
        id: typeof id === "string" ? id : "",
        patientId: "",
        patientName: "",
        date: date ?? "",
        start: start ?? "",
        end: end ?? "",
        status: "confirmado" as AppointmentStatus,
        notes: "",
    });

    useEffect(() => {
        AsyncStorage.getItem("@appointments_v1").then((result) => {
            console.log("Conteúdo do storage:", result);
        });
    }, []);


    useEffect(() => {
        let active = true;
        (async () => {
            // load patients with full name (name + lastName)
            try {
                const list = await getAllPatients();
                if (active && Array.isArray(list)) {
                    setPatients(list as Patient[])
                }
            } catch { }
            // editing path
            if (edit === "1" && form.id) {
                const found = await getAppointmentById(form.id);
                if (active && found) {
                    setForm({
                        id: found.id,
                        patientId: found.patientId,
                        patientName: found.patientName ?? "",
                        date: found.date,
                        start: found.start,
                        end: found.end,
                        status: found.status,
                        notes: found.notes ?? "",
                    });
                    if (found.patientName) {
                        setQuery(found.patientName);
                        setOpen(false);
                    }
                }
            }
        }
        )();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange<K extends keyof typeof form>(key: K, value: string) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    function pickPatient(p: Patient) {
        handleChange("patientId", p.id);
        handleChange("patientName", `${p.name} ${p.lastName}`.trim());
        setQuery(`${p.name} ${p.lastName}`.trim());
        setOpen(false); // close dropdown
        Keyboard.dismiss();
    }

    // make search accent/case-insensitive and avoid listing on empty query
    const normalize = (s: string) =>
        (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = React.useMemo(() => {
        const q = normalize(query.trim());
        if (!q) return [];
        return patients.filter((p) => normalize(`${p.name} ${p.lastName}`.trim()).includes(q));
    }, [patients, query]);


    const canSave = form.patientId.trim().length > 0 && !!form.date && !!form.start && !!form.end;

    async function handleSave() {
        Keyboard.dismiss();
        if (!canSave) {
            Alert.alert("Campos obrigatórios", "Selecione o paciente para continuar.");
            return;
        }

        const patient = patients.find(p => p.id === form.patientId);

        const payload: Appointment = {
            id: form.id || "",
            patientId: form.patientId.trim(),
            patientName: patient ? `${patient.name} ${patient.lastName}`.trim() : form.patientName.trim(),
            date: form.date,
            start: form.start,
            end: form.end,
            status: form.status,
            notes: form.notes?.trim() || undefined,
            sessionValue: patient ? patient.sessionValue : 0,
            isSocial: !!patient?.isSocial,
        };
        if (edit === "1" && form.id) {
            await updateAppointment(form.id, payload);
            Toast.show({
                type: "success",
                text1: "Sessão atualizada ✅",
                position: "bottom"
            });

        } else {
            console.log("Payload do agendamento:", payload);

            await createAppointment(payload);
            Toast.show({
                type: "success",
                text1: "Sessão criada ✅",
                position: "bottom"
            })
            Toast.show({
                type: "success",
                text1: "Sessão criada ✅",
                position: "bottom"
            });
        }
        router.back();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{edit === "1" ? "Editar Agendamento" : "Novo Agendamento"}</Text>

            {/* patient search (saves ID internally) */}
            <View style={{ marginBottom: 16 }}>

                <View style={styles.searchRow}>
                    <UserSearch size={20} color={theme.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar paciente por nome"
                        placeholderTextColor={theme.textLight}
                        value={query}
                        onFocus={() => setOpen(true)}
                        onChangeText={(text) => {
                            setQuery(text);
                            setOpen(true);
                            if (text.trim() === "") {
                                handleChange("patientId", "");
                                handleChange("patientName", "");
                            }
                        }}
                        autoCapitalize="words"
                    />
                    {query.trim().length > 0 && filtered.length > 0 && (
                        <Pressable
                            onPress={() => {
                                setQuery("");
                                setOpen(false);
                                handleChange("patientId", "");
                                handleChange("patientName", "");
                            }}
                            style={styles.clearBtn}
                        >
                            <Text style={styles.clearTxt}>✕</Text>
                        </Pressable>
                    )}
                </View>

                {open && filtered.length > 0 && (
                    <FlatList
                        data={filtered}
                        keyExtractor={(it) => it.id}
                        keyboardShouldPersistTaps="handled"
                        style={styles.suggestions}
                        renderItem={({ item }) => (
                            <Pressable onPress={() => pickPatient(item)} style={styles.suggestionItem}>
                                <Text style={styles.suggestionText}>{item.name} {item.lastName}</Text>
                            </Pressable>
                        )}
                    />
                )}
            </View>

            {/* read-only info coming from route */}
            {/* Data */}
            {edit === "1" ? (
                <TextInput
                    style={styles.input}
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor={theme.textLight}
                    value={form.date}
                    onChangeText={(v) => handleChange("date", v)}
                    autoCapitalize="none"
                />

            ) : (
                <View style={styles.readonly}>
                    <Text style={styles.readonlyText}>Data da Sessão: {form.date}</Text>
                </View>
            )}


            {edit === "1" ? (
                <TextInput
                    style={styles.input}
                    placeholder="HH:mm"
                    placeholderTextColor={theme.textLight}
                    value={form.start}
                    onChangeText={(v) => handleChange("start", v)}
                    keyboardType="numeric"
                    autoCapitalize="none"
                />
            ) : (
                <View style={styles.readonly}>
                    <Text style={styles.readonlyText}>Início da Sessão: {form.start}hs</Text>
                </View>
            )}


            {edit === "1" ? (
                <TextInput
                    style={styles.input}
                    placeholder="HH:mm"
                    placeholderTextColor={theme.textLight}
                    value={form.end}
                    onChangeText={(v) => handleChange("end", v)}
                    keyboardType="numeric"
                    autoCapitalize="none"
                />
            ) : (
                <View style={styles.readonly}>
                    <Text style={styles.readonlyText}>Término da Sessão: {form.end}hs</Text>
                </View>
            )}

            {edit === "1" && (
                <>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.pickerBox}>
                        <Picker
                            selectedValue={form.status}
                            onValueChange={(val) => handleChange("status", val as AppointmentStatus)}
                            dropdownIconColor={theme.textLight}
                            style={{ color: theme.text }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                            ))}
                        </Picker>
                    </View>
                </>
            )}

            <TouchableOpacity style={[styles.saveBtn, !canSave && { opacity: 0.5 }]} onPress={handleSave} disabled={!canSave}>
                <View style={styles.buttonItems}>
                    <Save size={25} color={theme.surface} />
                    <Text style={styles.saveTxt}>SALVAR</Text>
                </View>

            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <View style={styles.buttonItems}>
                    <X size={25} color={theme.surface} />
                    <Text style={styles.cancelTxt}>CANCELAR</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: theme.primary, marginBottom: 14, marginLeft: 10 },

    label: { color: theme.text, fontSize: 14, marginTop: 10, marginBottom: 6 },

    // read-only boxes
    readonly: {
        backgroundColor: theme.background,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 6
    },
    readonlyText: { color: theme.text, fontSize: 16 },

    // search box
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 8,
    },
    searchInput: { flex: 1, paddingVertical: 10, color: theme.text, fontSize: 16 },
    clearBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: theme.surface,
    },
    clearTxt: { color: theme.text, fontSize: 24, fontWeight: "bold" },

    suggestions: {
        marginTop: 6,
        maxHeight: 180,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        backgroundColor: theme.surface,
    },
    suggestionItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    suggestionText: { color: theme.text, fontWeight: "bold" },

    // buttons
    saveBtn: {
        marginTop: 16,
        backgroundColor: theme.primary,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.secondary,
    },
    saveTxt: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 10 },
    cancelBtn: {
        marginTop: 10,
        backgroundColor: theme.error,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.secondary,
    },

    cancelTxt: { color: theme.surface, fontWeight: "bold", fontSize: 18, marginLeft: 6 },

    input: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: theme.text,
        marginBottom: 8,
    },

    pickerBox: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        overflow: "hidden",
    },
    buttonItems: {
        flexDirection: "row",
        alignItems: "center"
    },

});
