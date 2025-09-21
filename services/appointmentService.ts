import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment } from "../types/appointment";

export interface GetAppointmentsParams {
  start: string; // "DD-MM-YYYY"
  end: string;
}

const STORAGE_KEY = "@appointments_v1";

function genId() {
  return `apt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toNum(s: string): number {
  const [dd, mm, yyyy] = s.split("-").map(Number);
  return (yyyy || 0) * 10000 + (mm || 0) * 100 + (dd || 0);
}

// -------- persistence helpers (AsyncStorage) --------
async function loadAll(): Promise<Appointment[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Appointment[]) : [];
  } catch {
    return [];
  }
}

async function saveAll(list: Appointment[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// -------- public API --------

// list all appointments in a date range
export async function getAppointments(params: GetAppointmentsParams): Promise<Appointment[]> {
  const all = await loadAll();
  const a = toNum(params.start);
  const b = toNum(params.end);
  return all
    .filter(x => {
      const n = toNum(x.date);
      return n >= a && n <= b;
    })
    .sort((x, y) => x.date.localeCompare(y.date) || x.start.localeCompare(y.start));
}

// get a single appointment by id
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const all = await loadAll();
  return all.find(a => a.id === id) ?? null;
}

// create a new appointment (persist)
export async function createAppointment(appt: Appointment): Promise<Appointment> {
  const all = await loadAll();
  const withId = appt.id && appt.id.trim().length > 0 ? appt : { ...appt, id: genId() };
  all.push(withId);
  await saveAll(all);
  return withId;
}

// update an existing appointment (persist)
// keep Partial<Appointment> to match your current callers
export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<Appointment | null> {
  const all = await loadAll();
  const idx = all.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const next = { ...all[idx], ...updates, id };
  all[idx] = next;
  await saveAll(all);
  return next;
}

// delete an appointment (persist)
export async function deleteAppointment(id: string): Promise<void> {
  const all = await loadAll();
  const next = all.filter(a => a.id !== id);
  await saveAll(next);
}
