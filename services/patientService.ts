import AsyncStorage from "@react-native-async-storage/async-storage";
import { Patient } from "../types/patient";

const STORAGE_KEY = "patients";

// Get all patients
export async function getAllPatients(): Promise<Patient[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as Patient[]) : [];
}

// Save all patients (replace the whole array)
export async function saveAllPatients(patients: Patient[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

// Create a new patient
export async function addPatient(patient: Patient): Promise<void> {
    const patients = await getAllPatients();
    patients.push(patient);
    await saveAllPatients(patients);
}

// Update an existing patient
export async function updatePatient(updatedPatient: Patient): Promise<void> {
    let patients = await getAllPatients();
    const idx = patients.findIndex((p) => p.id === updatedPatient.id);
    if (idx !== -1) {
        patients[idx] = updatedPatient;
        await saveAllPatients(patients);
    }
}

// Delete patient
export async function removePatient(id: string): Promise<void> {
    const patients = await getAllPatients();
    const filtered = patients.filter(p => p.id !== id);
    await saveAllPatients(filtered);
}

// Get single patient by ID
export async function getPatientById(id: string): Promise<Patient | null> {
    const patients = await getAllPatients();
    const found = patients.find((p) => p.id === id);
    return found ?? null;
}

// Utility filters for future reports (pure functions, no storage access)
export function filterSocial(patients: Patient[], isSocial: boolean): Patient[] {
    return patients.filter((p) => p.isSocial === isSocial);
}

export function sumSessionValues(patients: Patient[]): number {
    return patients.reduce((acc, p) => acc + (Number(p.sessionValue) || 0), 0);
}

