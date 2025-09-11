import AsyncStorage from "@react-native-async-storage/async-storage";
import { Patient } from "../types/patient";



// --- CRUD --- 

const STORAGE_KEY = "patients";

// Search all patients
export async function getAllPatients(): Promise<Patient[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save all patients (replace the whole array)
export async function saveAllPatients(patients: Patient[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

// Add a new patient
export async function addPatient(patient: Patient): Promise<void> {
    const patients = await getAllPatients();
    patients.push(patient);
    await saveAllPatients(patients);
}

// Update an existing patient
export async function updatePatient(updatedPatient: Patient): Promise<void> {
    let patients = await getAllPatients();
    patients = patients.map(p =>
        p.id === updatedPatient.id ? updatedPatient : p
    );
    await saveAllPatients(patients);
}

// Delete patient
export async function removePatient(id: string): Promise<void> {
    let patients = await getAllPatients();
    patients = patients.filter(p => p.id !== id);
    await saveAllPatients(patients);
}