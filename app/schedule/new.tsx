import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, Pressable, Keyboard } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theme } from "@/theme/theme";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { createAppointment, getAppointmentById, updateAppointment } from "@/services/appointmentService";
import { getAllPatients } from "@/services/patientService";
import { Picker } from "@react-native-picker/picker";

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

    const [query, setQuery] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [patients, setPatients] = React.useState<Array<{ id: string; fullName: string }>>([]);

    const [form, setForm] = React.useState({
        id: typeof id === "string" ? id : "",
        patientId: "",
        patientName: "",
        date: date ?? "",
        start: start ?? "",
        end: end ?? "",
        status: "confirmed" as AppointmentStatus,
        notes: "",
    });

    React.useEffect(() => {
        let active = true;
        (async () => {
            // load patients with full name (name + lastName)
            try {
                const list = await getAllPatients();
                if (active && Array.isArray(list)) {
                    setPatients(
                        list.map((p: any) => ({
                            id: String(p.id),
                            fullName: String(`${p.name ?? ""} ${p.lastName ?? ""}`).trim(),
                        }))
                    );
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

    function pickPatient(p: { id: string; fullName: string }) {
        handleChange("patientId", p.id);
        handleChange("patientName", p.fullName);
        setQuery(p.fullName);
        setOpen(false); // close dropdown
        Keyboard.dismiss();
    }

    // make search accent/case-insensitive and avoid listing on empty query
    const normalize = (s: string) =>
        (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = React.useMemo(() => {
        const q = normalize(query.trim());
        if (!q) return [];
        return patients.filter((p) => normalize(p.fullName).includes(q));
    }, [patients, query]);


    const canSave = form.patientId.trim().length > 0 && !!form.date && !!form.start && !!form.end;

    async function handleSave() {
        Keyboard.dismiss();
        if (!canSave) {
            Alert.alert("Campos obrigatórios", "Selecione o paciente para continuar.");
            return;
        }
        const payload: Appointment = {
            id: form.id || "",
            patientId: form.patientId.trim(),
            patientName: form.patientName.trim(),
            date: form.date,
            start: form.start,
            end: form.end,
            status: form.status,
            notes: form.notes?.trim() || undefined,
        };
        if (edit === "1" && form.id) {
            await updateAppointment(form.id, payload);
            Alert.alert("Agendamento", "Sessão atualizada.");
        } else {
            await createAppointment(payload);
            Alert.alert("Agendamento", "Sessão criada.");
        }
        router.back(); // agenda refetches on focus
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{edit === "1" ? "Editar agendamento" : "Novo agendamento"}</Text>

            {/* patient search (saves ID internally) */}
            <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>Paciente</Text>

                <View style={styles.searchRow}>
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
                                <Text style={styles.suggestionText}>{item.fullName}</Text>
                            </Pressable>
                        )}
                    />
                )}
            </View>

            {/* read-only info coming from route */}
            {/* Data */}
            <Text style={styles.label}>Data</Text>
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
                    <Text style={styles.readonlyText}>{form.date}</Text>
                </View>
            )}

            {/* Início */}
            <Text style={styles.label}>Início</Text>
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
                    <Text style={styles.readonlyText}>{form.start}</Text>
                </View>
            )}

            {/* Fim */}
            <Text style={styles.label}>Fim</Text>
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
                    <Text style={styles.readonlyText}>{form.end}</Text>
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
                <Text style={styles.saveTxt}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    title: { fontSize: 22, fontWeight: "700", color: theme.primary, marginBottom: 12 },

    label: { color: theme.text, fontSize: 12, marginTop: 10, marginBottom: 6 },

    // read-only boxes
    readonly: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    readonlyText: { color: theme.text, fontSize: 14 },

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
    searchInput: { flex: 1, paddingVertical: 10, color: theme.text },
    clearBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: theme.surface,
    },
    clearTxt: { color: theme.text, fontSize: 16, fontWeight: "600" },

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
    suggestionText: { color: theme.text, fontWeight: "600" },

    // buttons
    saveBtn: {
        marginTop: 16,
        backgroundColor: theme.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
    },
    saveTxt: { color: theme.surface, fontWeight: "700", fontSize: 16 },
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

    input: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: theme.text,
    },

    pickerBox: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        overflow: "hidden",
    },

});
