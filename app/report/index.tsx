"use client";

import DateTimePicker from "@react-native-community/datetimepicker";
import { FileText, TextSearch } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { getAppointments } from "@/services/appointmentService";
import { computeBasicKpis, computeByPatient, computeRevenueByPriceType, filterByPeriod } from "@/services/reportService";

import { getAllPatients } from "@/services/patientService";
import type { Appointment } from "@/types/appointment";
import { Patient } from "@/types/patient";
import type { BasicKpis, RevenueByPriceType } from "@/types/report";

import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Toast from "react-native-toast-message";
import { useTheme } from "../../context/ThemeContext";




/** Returns first day of the current month until end-of-today */
function getDefaultPeriod() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

/** Formats a Date as DD/MM/YYYY for display */
function formatDate(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatDateForStorage(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`; // igual ao que está salvo!
}

/** Parses Appointment.date ("DD-MM-YYYY") + start ("HH:mm") into a JS Date */
function parseAppointmentDate(a: Appointment): Date {
    const [dd, mm, yyyy] = (a.date || "").split("-").map(Number);
    const [hh, mi] = (a.start || "00:00").split(":").map(Number);
    return new Date(yyyy || 1970, (mm || 1) - 1, dd || 1, hh || 0, mi || 0, 0, 0);
}

export default function ReportsScreen() {
    // === Period state (Date objects) ===
    const [start, setStart] = useState<Date>(getDefaultPeriod().start);
    const [end, setEnd] = useState<Date>(getDefaultPeriod().end);

    // === Date pickers visibility ===
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // === Report options toggles ===
    const [includeTotals, setIncludeTotals] = useState(true);
    const [includeSocialVsFull, setIncludeSocialVsFull] = useState(true);

    // === Results ===
    const [totals, setTotals] = useState<BasicKpis | null>(null);
    const [socialBreakdown, setSocialBreakdown] = useState<RevenueByPriceType | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [patientAggregates, setPatientAggregates] = useState<any[]>([]);

    // Themes
    const theme = useTheme();
    const styles = StyleSheet.create({
        // Layout
        container: {
            flex: 1,
            backgroundColor: theme.background,
            padding: 16,
            marginTop: 50,
        },

        // Sections
        sectionTitle: {
            flex: 1,
            fontSize: 22,
            fontWeight: "bold",
            color: theme.primary,
            marginTop: 20,
            marginBottom: 8,
        },

        // Period row
        row: {
            flexDirection: "row",
            gap: 12,
        },
        inputCol: {
            flex: 1,
        },
        label: {
            fontSize: 14,
            color: theme.textLight,
            marginBottom: 4,
        },
        inputButton: {
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
        },
        inputButtonText: {
            color: theme.text,
            fontSize: 16,
            textAlign: "center",
        },

        // Options
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 0,
            paddingVertical: 0,
        },
        optionLabel: {
            fontSize: 16,
            color: theme.text,
            alignItems: "center",
            marginVertical: 0,
        },

        // Buttons
        primaryButton: {
            marginTop: 8,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.secondary,
            backgroundColor: theme.primary,
        },
        primaryButtonText: {
            fontWeight: "bold",
            color: theme.surface,
            fontSize: 18,
            marginLeft: 10,
        },
        secondaryButton: {
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.secondary,
            backgroundColor: theme.primary,
            marginBottom: 20,
        },
        secondaryButtonText: {
            fontWeight: "bold",
            color: theme.surface,
            fontSize: 18,
            marginLeft: 10,
        },

        // Feedback
        error: {
            color: theme.error,
            marginTop: 8,
        },

        // Results
        results: {
            marginTop: 10,
            gap: 12,
        },
        card: {
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            gap: 6,
            borderColor: theme.border,
            backgroundColor: theme.surface,
        },
        cardHeader: {
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            marginBottom: 4,
        },
        cardTitle: {
            fontWeight: "700",
            color: theme.text,
            fontSize: 16,
        },
        itemText: {
            color: theme.text,
        },
        buttonItems: {
            flexDirection: "row",
            alignItems: "center",
        },

        switchContainer: {
            backgroundColor: theme.surface,
            borderColor: theme.primary,
            borderWidth: 1,
            borderRadius: 12,
            marginBottom: 5,
        }
    });


    useEffect(() => {
        getAllPatients().then(setPatients);
    }, []);


    /** Normalizes start to beginning-of-day and end to end-of-day for inclusive filtering */
    const normalizedPeriod = useMemo<{ start: Date; end: Date }>(() => {
        const startNorm = new Date(start);
        startNorm.setHours(0, 0, 0, 0);

        const endNorm = new Date(end);
        endNorm.setHours(23, 59, 59, 999);

        return { start: startNorm, end: endNorm };
    }, [start, end]);

    /** Fetch, filter, and compute metrics based on active switches */
    async function handleGenerate() {
        setLoading(true);
        setErrorMsg(null);
        setTotals(null);
        setSocialBreakdown(null);


        try {
            if (normalizedPeriod.start.getTime() > normalizedPeriod.end.getTime()) {
                throw new Error("A data inicial não pode ser maior que a data final.");
            }

            if (patients.length === 0) {
                setErrorMsg("Ainda carregando pacientes. Aguarde um momento e tente novamente.");
                return;
            }

            // Backend fetch        
            const appointments: Appointment[] = await getAppointments({
                start: formatDateForStorage(normalizedPeriod.start),
                end: formatDateForStorage(normalizedPeriod.end),
            });


            // Inclusive filter using real Appointment shape (DD-MM-YYYY + HH:mm)
            const filtered = filterByPeriod(
                appointments,
                (a) => parseAppointmentDate(a),
                { start, end }
            );

            const patientAggregates = computeByPatient(filtered, patients)
            setPatientAggregates(patientAggregates);


            setFilteredAppointments(filtered);

            console.log("Pacientes disponíveis:", patients);
            console.log("Agendamentos filtrados:", filtered);
            console.log("Exemplo patient do agendamento[0]:", patients.find((p) => p.id === filtered[0]?.patientId));


            console.log("Appointments recebidos:", appointments);
            console.log("Período normalizado:", normalizedPeriod);
            appointments.forEach(a => {
                console.log("Agendamento:", a.date, a.start, "->", parseAppointmentDate(a));

            });


            // Totals
            if (includeTotals) {
                const k = computeBasicKpis(filtered, {
                    getPrice: (a) => {
                        const p = patients.find((pt) => pt.id === a.patientId);
                        return p?.sessionValue ?? 0;
                    },
                    getStatus: (a) => a.status, // "confirmado" | "pendente" | "cancelado" | "faltou"
                    countStatuses: ["confirmado", "pendente", "faltou", "cancelado"],
                    revenueStatuses: ["confirmado"],
                    canceledStatuses: ["cancelado", "faltou"],
                });
                setTotals(k);
            }

            // Valor social vs. integral
            if (includeSocialVsFull) {
                const r = computeRevenueByPriceType(filtered, {
                    getPrice: (a) => {
                        const p = patients.find((pt) => pt.id === a.patientId);
                        return p?.sessionValue ?? 0;
                    },
                    getStatus: (a) => a.status,
                    isSocial: (a) => {
                        const p = patients.find((pt) => pt.id === a.patientId);
                        return !!p?.isSocial;
                    },
                    countStatuses: ["confirmado"],
                    revenueStatuses: ["confirmado"],
                });
                setSocialBreakdown(r);
            }
        } catch (err: any) {
            setErrorMsg(err?.message || "Erro ao gerar relatório.");
        } finally {
            setLoading(false);
        }
    }

    // === Date picker handlers (start) ===
    function onChangeStart(_: any, selected?: Date) {
        setShowStartPicker(Platform.OS === "ios");
        if (selected) {
            const s = new Date(selected);
            s.setHours(0, 0, 0, 0);
            setStart(s);
        }
    }

    // === Date picker handlers (end) ===
    function onChangeEnd(_: any, selected?: Date) {
        setShowEndPicker(Platform.OS === "ios");
        if (selected) {
            const e = new Date(selected);
            e.setHours(23, 59, 59, 999);
            setEnd(e);
        }
    }

    // === Generates report in text
    function generateReportText({
        totals,
        socialBreakdown,
        appointments,
        patients,
        start,
        end,
        patientAggregates,
    }: {
        totals: BasicKpis | null;
        socialBreakdown: RevenueByPriceType | null;
        appointments: Appointment[];
        patients: Patient[];
        start: Date;
        end: Date;
        patientAggregates: any[];
    }) {
        // Report header
        let text = "";
        text += `RELATÓRIO DE AGENDAMENTOS\n\n`;
        text += `Período: ${formatDate(start)} a ${formatDate(end)}\n\n`;

        // totals
        if (totals) {
            text += `=== TOTAIS ===\n`;
            text += `Consultas: ${totals.sessionCount}\n`;
            text += `Consultas canceladas: ${totals.canceledCount}\n`;
            text += `Faturamento total: R$ ${totals.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;
        }

        // Valor Social vs Integral
        if (socialBreakdown) {
            text += `=== SOCIAL vs INTEGRAL ===\n`;
            text += `Valor social - Pacientes: ${socialBreakdown.socialCount} | Valor R$ ${socialBreakdown.socialRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
            text += `Valor Integral - Pacientes: ${socialBreakdown.fullCount} | Valor R$ ${socialBreakdown.fullRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;
        }

        // Appointment' details
        if (patientAggregates.length > 0) {
            text += `=== AGENDAMENTOS DETALHADOS ===\n`
            patientAggregates.forEach((p, idx) => {
                text += `${idx + 1}. Paciente: ${p.name}\n`;
                text += `   Tipo: ${p.isSocial ? "Social" : "Integral"}\n`;
                text += `   Sessões: ${p.totalSessions}\n`;
                text += `   Total: R$ ${p.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n`;
            });
        } else {
            text += `Nenhum agendamento encontrado neste período.\n`;
        }

        text += "\n---\nRelatório gerado pelo PsicoApp 𝚿";

        return text;
    }

    const [reportText, setReportText] = useState<string>("");

    useEffect(() => {
        if (totals || socialBreakdown) {
            const txt = generateReportText({
                totals,
                socialBreakdown,
                appointments: filteredAppointments,
                patients,
                start,
                end,
                patientAggregates,
            });
            setReportText(txt);
        }
    }, [totals, socialBreakdown, filteredAppointments, patients, start, end]);

    async function handleShareReport() {
        try {
            // save in cache temp txt
            const file = new File(Paths.cache, "relatorio_psicoapp.txt")
            file.write(reportText);

            await Sharing.shareAsync(file.uri, { mimeType: "text/plain" });
        } catch (err) {
            Toast.show({ type: "error", text1: "Erro ao compartilhar", text2: String(err), position: "bottom" });
        }
    }

    async function handleCopyReport() {
        try {
            await Clipboard.setStringAsync(reportText);
            Toast.show({ type: "success", text1: "Relatório copiado para a área de transferência!", position: "bottom" });
        } catch (err) {
            Toast.show({ type: "error", text1: "Erro ao copiar texto", text2: String(err), position: "bottom" });
        }
    }
    return (
        <ScrollView style={styles.container}>
            {/* ===== Period ===== */}
            <Text style={styles.sectionTitle}>Período</Text>

            <View style={styles.row}>
                <View style={styles.inputCol}>
                    <Text style={styles.label}>Início</Text>
                    <Pressable style={styles.inputButton} onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.inputButtonText}>{formatDate(start)}</Text>
                    </Pressable>
                    {showStartPicker && (
                        <DateTimePicker value={start} mode="date" display="calendar" onChange={onChangeStart} />
                    )}
                </View>

                <View style={styles.inputCol}>
                    <Text style={styles.label}>Fim</Text>
                    <Pressable style={styles.inputButton} onPress={() => setShowEndPicker(true)}>
                        <Text style={styles.inputButtonText}>{formatDate(end)}</Text>
                    </Pressable>
                    {showEndPicker && (
                        <DateTimePicker value={end} mode="date" display="calendar" onChange={onChangeEnd} />
                    )}
                </View>
            </View>

            {/* ===== Report Options ===== */}
            <Text style={[styles.sectionTitle, { paddingLeft: 5 }]}>Opções do Relatório</Text>

            <View style={styles.switchContainer}>
                <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, { paddingLeft: 10 }]}>Totais</Text>
                    <Switch thumbColor={theme.primary} value={includeTotals} onValueChange={setIncludeTotals} />
                </View>
            </View>
            <View style={styles.switchContainer}>
                <View style={styles.optionRow}>
                    <Text style={[styles.optionLabel, { paddingLeft: 10 }]}>Valor Social vs. Valor Integral</Text>
                    <Switch thumbColor={theme.primary} value={includeSocialVsFull} onValueChange={setIncludeSocialVsFull} />
                </View>
            </View>
            {/* ===== Actions ===== */}
            <Pressable style={styles.primaryButton} onPress={handleGenerate} disabled={loading}>
                <View style={styles.buttonItems}>
                    <TextSearch size={25} color={theme.surface} />
                    <Text style={styles.primaryButtonText}>{loading ? "Gerando..." : "Gerar Relatório"}</Text>
                </View>
            </Pressable>

            {/* ===== Errors ===== */}
            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            {/* ===== Results ===== */}
            <View style={styles.results}>
                {(totals || socialBreakdown) && (
                    <>
                        <View style={styles.results}>
                            {totals && (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Totais</Text>
                                    </View>
                                    <Text style={styles.itemText}>Consultas: {totals.sessionCount}</Text>
                                    <Text style={styles.itemText}>Consultas Canceladas: {totals.canceledCount}</Text>
                                    <Text style={styles.itemText}>
                                        Faturamento Total: R$ {totals.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            )}

                            {socialBreakdown && (
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Valor Social vs. Valor Integral</Text>
                                    <Text style={styles.itemText}>
                                        Valor Social — Pacientes: {socialBreakdown.socialCount} | Valor: R$ {socialBreakdown.socialRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </Text>
                                    <Text style={styles.itemText}>
                                        Valor Integral — Pacientes: {socialBreakdown.fullCount} | Valor: R$ {socialBreakdown.fullRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            )}

                            {totals && patients.length > 0 && (
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>Agendamentos Detalhados</Text>

                                    {patientAggregates.map((p) => (
                                        <View key={p.patientId} style={{ marginBottom: 12 }}>
                                            <Text style={{ fontWeight: "bold" }}>{p.name}</Text>
                                            <Text>Sessões: {p.totalSessions}</Text>
                                            <Text>Tipo: {p.isSocial ? "Social" : "Integral"}</Text>
                                            <Text>Total: R$ {p.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
                                        </View>
                                    ))}

                                </View>
                            )}

                        </View>

                        {/* Exports txt file */}
                        < View style={{ marginTop: 5 }}>
                            <Pressable style={styles.secondaryButton} onPress={handleShareReport}>
                                <View style={styles.buttonItems}>
                                    <FileText size={25} color={theme.surface} />
                                    <Text style={styles.secondaryButtonText}>Compartilhar Relatório</Text>
                                </View>
                            </Pressable>
                            <Pressable style={styles.secondaryButton} onPress={handleCopyReport}>
                                <View style={styles.buttonItems}>
                                    <FileText size={25} color={theme.surface} />
                                    <Text style={styles.secondaryButtonText}>Copiar Texto</Text>
                                </View>
                            </Pressable>
                        </View>

                    </>
                )}
            </View>
        </ScrollView>
    );
}



