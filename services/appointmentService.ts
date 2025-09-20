import { Appointment } from "../types/appointment";

export interface GetAppointmentsParams {
  start: string; // "DD-MM-YYYY"
  end: string;
}

// fake in-memory store for now
let MOCK_APPOINTMENTS: Appointment[] = [];

// list all appointments in a date range
export async function getAppointments(_params: GetAppointmentsParams): Promise<Appointment[]> {
  // TODO: replace with API call
  return Promise.resolve(MOCK_APPOINTMENTS);
}

// get a single appointment by id
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  // TODO: replace with API call
  const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
  return Promise.resolve(found ?? null);
}

// create a new appointment
export async function createAppointment(appt: Appointment): Promise<Appointment> {
  // TODO: replace with API call
  MOCK_APPOINTMENTS.push(appt);
  return Promise.resolve(appt);
}

// update an existing appointment
export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  // TODO: replace with API call
  const idx = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
  if (idx === -1) return Promise.resolve(null);
  MOCK_APPOINTMENTS[idx] = { ...MOCK_APPOINTMENTS[idx], ...updates };
  return Promise.resolve(MOCK_APPOINTMENTS[idx]);
}

// delete an appointment
export async function deleteAppointment(id: string): Promise<void> {
  // TODO: replace with API call
  MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.filter((a) => a.id !== id);
  return Promise.resolve();
}
