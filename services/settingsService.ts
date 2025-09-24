import { UserSettings } from "@/types/settings";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = "userSettings";

export async function saveSettings(settings: UserSettings) {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadSettings(): Promise<UserSettings | null> {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? JSON.parse(json) : null;
}

export async function resetSettings() {
    await AsyncStorage.removeItem(SETTINGS_KEY);
}