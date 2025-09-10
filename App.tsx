import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen";
import AgendaScreen from "./screens/AgendaScreen";
import RelatoriosScreen from "./screens/RelatoriosScreen";
import ConfigScreen from "./screens/ConfigScreen";

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Agenda" component={AgendaScreen} />
                <Tab.Screen name="Relatórios" component={RelatoriosScreen} />
                <Tab.Screen name="mais" component={ConfigScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
