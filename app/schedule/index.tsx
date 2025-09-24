import { useHeaderOffset } from "@/lib/ui/layout";
import { getAppointments } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

  
// ===== helpers =====
const HOURS = Array.from({ length: 16 }, (_, i) => 7 + i);

function toISODate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}
function fromDateStr(s: string): Date {
    const [dd, mm, yyyy] = s.split("-").map(Number);
    return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1);
}
function getMonday(d: Date): Date {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const js = dd.getDay(); // 0..6 (Sun..Sat)
    const diff = (js === 0 ? -6 : 1) - js; // Monday
    dd.setDate(dd.getDate() + diff);
    dd.setHours(0, 0, 0, 0);
    return dd;
}
function addDays(base: Date, n: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
}
function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}
function addWeeks(base: Date, n: number): Date {
    return addDays(base, n * 7);
}
function formatRangeLabel(start: Date): string {
    const end = addDays(start, 6);
    const fmt = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd}/${mm}/${yy}`;
    }
    return `${fmt(start)} – ${fmt(end)}`;
}

const WEEKDAYS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
function labelForDay(d: Date): string {
    const w = WEEKDAYS_PT[d.getDay()];
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

// ===== screen =====
export default function ScheduleWeekScreen() {
    const headerOffset = useHeaderOffset();
    const router = useRouter();

    const daysListRef = useRef<FlatList<Date>>(null);

    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

    const today = new Date();
    const baseStart = useMemo(() => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        d.setHours(0, 0, 0, 0);
        return addDays(d, weekOffset * 7);
    }, [weekOffset]);

    const weekStart = useMemo(() => addWeeks(getMonday(new Date()), weekOffset), [weekOffset]);
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(baseStart, i)), [baseStart]);

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Appointment[]>([]);

    const startISO = toISODate(weekDays[0]);
    const endISO = toISODate(weekDays[6]);

    // Themes
    const theme = useTheme();
    const DAY_ITEM_WIDTH = 100;
    const H_PADDING = 5;

    const styles = StyleSheet.create({
        title: {
            flex: 1,
            fontSize: 22,
            fontWeight: "bold",
            color: theme.primary,
        },

        container: {
            flex: 1,
            backgroundColor: theme.background,
        },

        // days bar
        daysWrap: {
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: H_PADDING,
            marginTop: 6,
            paddingLeft: 20,
            paddingRight: 20,
        },
        navBtn: {
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            marginHorizontal: 4,
        },
        daysList: { gap: 12, paddingVertical: 4 },
        daysFadeLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: 12, zIndex: 10 },
        daysFadeRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: 12, zIndex: 10 },

        gridWrapper: { flex: 1, position: "relative", marginTop: 8 },
        gridContent: { paddingTop: 8, paddingBottom: 20 },
        fadeTop: { position: "absolute", left: 0, right: 0, top: 0, height: 22, zIndex: 10 },
        fadeBottom: { position: "absolute", left: 0, right: 0, bottom: 0, height: 28, zIndex: 10 },

        timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginRight: 20 },
        timeCol: { width: 56, alignItems: "flex-end", marginRight: 12 },
        timeTxt: { color: theme.text, fontVariant: ["tabular-nums"] as any, marginLeft: 20 },

        // smaller card so hour+card look centered together
        slotCard: {
            flex: 1,
            backgroundColor: theme.surface,
            borderColor: theme.secondary,
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 12,
            justifyContent: "center",
        },

        apptCard: {
            borderRadius: 10,
            borderWidth: 2,
            padding: 8,
            borderColor: theme.border,
            backgroundColor: theme.background,
            marginBottom: 6,
        },
        apptTitle: { color: theme.text, fontWeight: "bold", marginBottom: 2 },
        apptTime: { color: theme.textLight, fontSize: 12 },

        apptConfirmed: { borderColor: theme.success },
        apptPending: { borderColor: theme.warning },
        apptCanceled: { borderColor: theme.error },
        apptNoShow: { borderColor: theme.border },


        // loading
        loadingOverlay: {
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#00000022",
            alignItems: "center",
            justifyContent: "center",
        },
        loadingText: { color: theme.surface, fontWeight: "bold" },

        weekHeader: {
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 4,
        },
        weekHeaderTitle: {
            color: theme.primary,
            fontWeight: "700",
            fontSize: 18,
        },
        weekHomeBtn: {
            marginTop: 2,
            padding: 4,
        },

        dayCol: {
            alignItems: "center",
            justifyContent: "center",
            width: DAY_ITEM_WIDTH,
            paddingVertical: 2,
        },
        dayColActive: {
            backgroundColor: theme.background,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.secondary,
        },
        dayNumber: {
            fontSize: 18,
            alignItems: "center",
            color: theme.textLight,
            marginBottom: -2,
        },
        dayNumberActive: {
            color: theme.primary,
            fontWeight: "bold",
        },
        dayWeekday: {
            fontSize: 14,
            alignItems: "center",
            color: theme.textLight,
            marginBottom: 0,
        },
        dayWeekdayActive: {
            color: theme.primary,
            fontWeight: "bold",
        },
        dayCount: {
            fontSize: 16,
            color: theme.textLight,
            marginTop: 0,
        },
        dayCountActive: {
            color: theme.primary,
            fontWeight: "bold",
        },


    });


    // Always refetch on focus so newly created items appear
    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                setLoading(true);
                try {
                    const data = await getAppointments({ start: startISO, end: endISO });
                    if (active) setItems(data ?? []);
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

    // group by day
    const byDay = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        for (const d of weekDays) map[toISODate(d)] = [];
        const t0 = fromDateStr(startISO).getTime();
        const t1 = fromDateStr(endISO).getTime();
        for (const appt of items) {
            const t = fromDateStr(appt.date).getTime();
            if (t >= t0 && t <= t1) {
                map[appt.date] ??= [];
                map[appt.date].push(appt);
            }
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        }
        return map;
    }, [items, weekDays, startISO, endISO]);

    const selectedDateISO = toISODate(weekDays[selectedDayIdx]);
    const dayAppointments = byDay[selectedDateISO] ?? [];

    return (
        <View style={[styles.container, { paddingTop: headerOffset }]}>

            <View style={styles.weekHeader}>
                <Text style={styles.weekHeaderTitle}>{formatRangeLabel(baseStart)}</Text>
                <TouchableOpacity
                    onPress={() => {
                        setWeekOffset(0);
                        setSelectedDayIdx(0);
                        requestAnimationFrame(() => {
                            daysListRef.current?.scrollToIndex({
                                index: 0,
                                animated: true,
                                viewPosition: 0.5,
                            });
                        });
                    }}
                    style={styles.weekHomeBtn}
                >
                    <CornerDownLeft size={25} color={theme.secondary} />
                </TouchableOpacity>
            </View>

            {/* Days carousel with side fades */}
            <View style={styles.daysWrap}>

                <Pressable onPress={() => setWeekOffset((w) => w - 1)} style={styles.navBtn} hitSlop={8}>
                    <ChevronLeft size={30} color={theme.primary} />
                </Pressable>
                <LinearGradient
                    pointerEvents="none"
                    colors={[theme.background, "transparent"]}
                    locations={[0, 0.6]}
                    style={styles.daysFadeLeft}
                />

                <FlatList
                    horizontal
                    data={weekDays}
                    keyExtractor={(d) => toISODate(d)}
                    contentContainerStyle={styles.daysList}
                    showsHorizontalScrollIndicator={false}
                    ref={daysListRef}
                    onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                            daysListRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0.5,
                            });
                        }, 300);
                    }}

                    getItemLayout={(_, index) => ({ length: DAY_ITEM_WIDTH, offset: DAY_ITEM_WIDTH * index, index })}
                    renderItem={({ item, index }) => {
                        const iso = toISODate(item);
                        const count = (byDay[iso]?.length ?? 0);
                        const selected = index === selectedDayIdx;
                        return (
                            <Pressable
                                onPress={() => {
                                    setSelectedDayIdx(index);
                                    daysListRef.current?.scrollToIndex({
                                        index,
                                        animated: true,
                                        viewPosition: 0.5,
                                    });
                                }}
                            >
                                <View style={[styles.dayCol, selected && styles.dayColActive]}>
                                    <Text style={[styles.dayNumber, selected && styles.dayNumberActive]}>
                                        {String(item.getDate()).padStart(2, "0")}
                                    </Text>
                                    <Text style={[styles.dayWeekday, selected && styles.dayWeekdayActive]}>
                                        {labelForDay(item).split(" ")[0]}
                                    </Text>
                                    <Text style={[styles.dayCount, selected && styles.dayCountActive]}>
                                        {count} {count === 1 ? "sessão" : "sessões"}
                                    </Text>
                                </View>

                            </Pressable>
                        );
                    }}
                />

                <Pressable onPress={() => setWeekOffset((w) => w + 1)} style={styles.navBtn} hitSlop={8}>
                    <ChevronRight size={30} color={theme.primary} />
                </Pressable>

                <LinearGradient
                    pointerEvents="none"
                    colors={["transparent", theme.background]}
                    locations={[0.4, 1]}
                    style={styles.daysFadeRight}
                />
            </View>

            {/* Time grid with vertical fades */}
            <View style={styles.gridWrapper}>
                <LinearGradient
                    pointerEvents="none"
                    colors={[theme.background, "transparent"]}
                    locations={[0, 0.7]}
                    style={styles.fadeTop}
                />
                <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
                    {HOURS.map((h) => {
                        const slotStart = hourToMinutes(h);
                        const slotEnd = hourToMinutes(h + 1);
                        const inThisSlot = dayAppointments.filter((a) =>
                            overlaps(timeToMinutes(a.start), timeToMinutes(a.end), slotStart, slotEnd)
                        );

                        return (
                            <View key={h} style={styles.timeRow}>
                                <View style={styles.timeCol}>
                                    <Text style={styles.timeTxt}>{String(h).padStart(2, "0")}:00</Text>
                                </View>

                                <Pressable
                                    style={styles.slotCard}
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
                                        <Text style={{ color: theme.accent }}>Horário Livre</Text>
                                    ) : (
                                        inThisSlot.map((a) => (
                                            <Pressable
                                                key={a.id}
                                                onPress={() =>
                                                    router.push({ pathname: "/schedule/[id]", params: { id: a.id } })
                                                }
                                                style={[
                                                    styles.apptCard,
                                                    a.status === "confirmado" && styles.apptConfirmed,
                                                    a.status === "pendente" && styles.apptPending,
                                                    a.status === "cancelado" && styles.apptCanceled,
                                                    a.status === "faltou" && styles.apptNoShow,
                                                ]}
                                            >
                                                <Text numberOfLines={1} style={styles.apptTitle}>
                                                    {a.patientName}
                                                </Text>

                                            </Pressable>
                                        ))
                                    )}
                                </Pressable>
                            </View>
                        );
                    })}
                    <View style={{ height: 12 }} />
                </ScrollView>
                <LinearGradient
                    pointerEvents="none"
                    locations={[0.3, 1]}
                    colors={["transparent", theme.background]}
                    style={styles.fadeBottom}
                />
            </View>

            {
                loading ? (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>Carregando…</Text>
                    </View>
                ) : null
            }
        </View >
    );
}



