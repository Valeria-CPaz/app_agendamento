import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Pressable,
    ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { theme } from "../../theme/theme";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { getAppointments } from "../../services/appointmentService";


const HOURS = Array.from({ length: 16 }, (_, i) => 7 + i);

function toISODate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function fromDateStr(s: string): Date {
    // convert "DD-MM-YYYY" -> Date
    const [dd, mm, yyyy] = s.split("-").map(Number);
    return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1);
}

function getMonday(d: Date): Date {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const js = dd.getDay(); // 0..6 (Dom..Sab)
    const diff = (js === 0 ? -6 : 1) - js; // segunda-feira
    dd.setDate(dd.getDate() + diff);
    dd.setHours(0, 0, 0, 0);
    return dd;
}

function addDays(base: Date, n: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
}

function addWeeks(base: Date, n: number): Date {
    return addDays(base, n * 7);
}

function formatRangeLabel(start: Date): string {
    const end = addDays(start, 6);
    const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `${fmt(start)} – ${fmt(end)}`;
}

const WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function weekDayIndex(date: Date): number {
    // 0 = Seg ... 6 = Dom | JS: 0=Dom..6=Sab
    const js = date.getDate(); // 0..6
    return js === 0 ? 6 : js - 1;
}
function labelForDay(d: Date): string {
    const w = WEEKDAYS_PT[weekDayIndex(d)];
    return `${w} ${String(d.getDate()).padStart(2, "0")}`;
}
function hourToMinutes(h: number): number {
    return h * 60;
}
function timeToMinutes(t: string): number {
    const [H, M] = t.split(":").map(Number);
    return (H || 0) * 60 + (M || 0);
}
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
    return aStart < bEnd && bStart < aEnd;
}

// ===== Component =====
export default function ScheduleWeekScreen() {
    const router = useRouter();
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => weekDayIndex(new Date()));
    const cacheRef = useRef<Map<string, Appointment[]>>(new Map());
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Appointment[]>([]);

    const weekStart = useMemo(() => {
        const base = getMonday(new Date());
        return addWeeks(base, weekOffset);
    }, [weekOffset]);

    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    const startISO = toISODate(weekDays[0]);
    const endISO = toISODate(weekDays[6]);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            (async () => {
                setLoading(true);
                const key = `${startISO}|${endISO}`;
                try {
                    if (cacheRef.current.has(key)) {
                        if (active) setItems(cacheRef.current.get(key) || []);
                    } else {
                        const data = await getAppointments({ start: startISO, end: endISO });
                        if (active) {
                            setItems(data ?? []);
                            cacheRef.current.set(key, data ?? []);
                        }
                    }
                } catch {
                    if (active) setItems([]);
                } finally {
                    if (active) setLoading(false);
                }
            })();

            return () => {
                active = false;
            };
        }, [startISO, endISO])
    );

    // Group by day
    const byDay = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        for (const d of weekDays) {
            map[toISODate(d)] = [];
        }
        const startTime = fromDateStr(startISO).getTime();
        const endTime = fromDateStr(endISO).getTime();

        for (const appt of items) {
            const t = fromDateStr(appt.date).getTime();
            if (t >= startTime && t <= endTime) {
                map[appt.date] ??= [];
                map[appt.date].push(appt);
            }
        }

        // Dort by time
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        }
        return map;
    }, [items, weekDays, startISO, endISO]);

    const selectedDateISO = toISODate(weekDays[selectedDayIdx]);
    const dayAppointments = byDay[selectedDateISO] ?? [];

    // ===== UI =====
    return (
        <View style={styles.container}>
            {/* Header semana */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => setWeekOffset((w) => w - 1)}
                >
                    <Text style={styles.headerBtnText}>◀</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Semana {formatRangeLabel(weekStart)}</Text>
                    <TouchableOpacity onPress={() => {
                        setWeekOffset(0);
                        setSelectedDayIdx(weekDayIndex(new Date()));
                    }}>
                        <Text style={styles.todayLink}>Hoje</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => setWeekOffset((w) => w + 1)}
                >
                    <Text style={styles.headerBtnText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Carrossel de dias */}
            <FlatList
                horizontal
                data={weekDays}
                keyExtractor={(d) => toISODate(d)}
                contentContainerStyle={styles.daysList}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const iso = toISODate(item);
                    const count = byDay[iso]?.length ?? 0;
                    const selected = index === selectedDayIdx;
                    return (
                        <Pressable
                            onPress={() => setSelectedDayIdx(index)}
                            style={[
                                styles.dayPill,
                                selected && styles.dayPillActive,
                            ]}
                        >
                            <Text style={[styles.dayPillText, selected && styles.dayPillTextActive]}>
                                {labelForDay(item)}
                            </Text>
                            <Text style={[styles.dayCount, selected && styles.dayCountActive]}>
                                {count} sessão{count === 1 ? "" : "s"}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* Grade de horários + sessões do dia selecionado */}
            <ScrollView style={styles.gridWrapper} contentContainerStyle={styles.gridContent}>
                {HOURS.map((h) => {
                    const slotStart = hourToMinutes(h);
                    const slotEnd = hourToMinutes(h + 1);

                    // sessões que “tocam” esse slot (overlap simples)
                    const inThisSlot = dayAppointments.filter((a) =>
                        overlaps(timeToMinutes(a.start), timeToMinutes(a.end), slotStart, slotEnd)
                    );

                    return (
                        <View key={h} style={styles.hourRow}>
                            <Text style={styles.hourLabel}>{String(h).padStart(2, "0")}:00</Text>

                            <Pressable
                                style={styles.hourCell}
                                onPress={() =>
                                    router.push({
                                        pathname: "/schedule/new",
                                        params: {
                                            date: selectedDateISO,
                                            start: `${String(h).padStart(2, "0")}:00`,
                                            end: `${String(h + 1).padStart(2, "0")}:00`,
                                        },
                                    })
                                }
                                android_ripple={{ color: "#00000011" }}
                            >
                                {inThisSlot.length === 0 ? (
                                    <Text style={styles.freeText}>Livre</Text>
                                ) : (
                                    inThisSlot.map((a) => (
                                        <Pressable
                                            key={a.id}
                                            onPress={() =>
                                                router.push({ pathname: "/schedule/[id]", params: { id: a.id } })
                                            }
                                            style={[
                                                styles.apptCard,
                                                a.status === "confirmed" && styles.apptConfirmed,
                                                a.status === "pending" && styles.apptPending,
                                                a.status === "canceled" && styles.apptCanceled,
                                                a.status === "no_show" && styles.apptNoShow,
                                            ]}
                                        >
                                            <Text numberOfLines={1} style={styles.apptTitle}>
                                                {a.patientName}
                                            </Text>
                                            <Text style={styles.apptTime}>
                                                {a.start}–{a.end}
                                                {typeof a.price === "number" ? ` · R$ ${a.price}` : ""}
                                            </Text>
                                        </Pressable>
                                    ))
                                )}
                            </Pressable>
                        </View>
                    );
                })}
                <View style={{ height: 16 }} />
            </ScrollView>

            {/* Botão rápido de novo agendamento no dia selecionado */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: "/schedule/new", params: { date: selectedDateISO } })}
            >
                <Text style={styles.fabText}>+ Novo</Text>
            </TouchableOpacity>

            {loading ? <View style={styles.loadingOverlay}><Text style={styles.loadingText}>Carregando…</Text></View> : null}
        </View>
    );
}

// ===== Styles =====
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    headerBtn: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    headerBtnText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
    headerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    headerTitle: {
        color: theme.primary,
        fontWeight: "bold",
        fontSize: 16,
    },
    todayLink: {
        fontSize: 12,
        color: theme.textLight,
        textDecorationLine: "underline",
    },

    daysList: { gap: 8, paddingVertical: 4 },
    dayPill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        alignItems: "center",
        minWidth: 90,
    },
    dayPillActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    dayPillText: { color: theme.text, fontWeight: "600" },
    dayPillTextActive: { color: theme.surface },
    dayCount: { fontSize: 12, color: theme.textLight },
    dayCountActive: { color: theme.surface },

    gridWrapper: { flex: 1, marginTop: 8 },
    gridContent: { paddingBottom: 80 },
    hourRow: {
        flexDirection: "row",
        marginBottom: 6,
        alignItems: "stretch",
    },
    hourLabel: {
        width: 56,
        textAlign: "right",
        marginRight: 8,
        color: theme.textLight,
        fontSize: 12,
        paddingTop: 10,
    },
    hourCell: {
        flex: 1,
        minHeight: 46,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        padding: 8,
        justifyContent: "center",
        gap: 6,
    },
    freeText: { color: theme.textLight, fontSize: 12 },

    apptCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 8,
        borderColor: theme.border,
        backgroundColor: theme.background,
    },
    apptTitle: { color: theme.text, fontWeight: "700", marginBottom: 2 },
    apptTime: { color: theme.textLight, fontSize: 12 },

    apptConfirmed: { backgroundColor: theme.success, borderColor: theme.success, opacity: 0.9 },
    apptPending: { backgroundColor: theme.warning, borderColor: theme.warning, opacity: 0.9 },
    apptCanceled: { backgroundColor: theme.error, borderColor: theme.error, opacity: 0.9 },
    apptNoShow: { backgroundColor: theme.border, borderColor: theme.border, opacity: 0.9 },

    fab: {
        position: "absolute",
        right: 16,
        bottom: 16,
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.border,
        elevation: 2,
    },
    fabText: { color: theme.surface, fontWeight: "bold" },

    loadingOverlay: {
        position: "absolute",
        left: 0, top: 0, right: 0, bottom: 0,
        backgroundColor: "#00000022",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: { color: theme.surface, fontWeight: "bold" },
});







