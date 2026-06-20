import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import PacientesScreen from "./screens/PacientesScreen";
import CitasScreen from "./screens/CitasScreen";
import AutorizacionesScreen from "./screens/AutorizacionesScreen";
import PerfilScreen from "./screens/PerfilScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const iconos = {
    Dashboard: focused ? "🏠" : "🏠",
    Citas: focused ? "📅" : "📅",
    Pacientes: focused ? "👥" : "👥",
    Perfil: focused ? "👤" : "👤",
  };
  return <Text style={{ fontSize: 20 }}>{iconos[label]}</Text>;
}

function MainTabs({ route }) {
  const { token, usuario } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0F6E56",
        tabBarInactiveTintColor: "#6C757D",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#DEE2E6",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={tabRoute.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard">
        {(props) => (
          <DashboardScreen {...props} route={{ params: { token, usuario } }} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Citas">
        {(props) => (
          <CitasScreen {...props} route={{ params: { token, usuario } }} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Pacientes">
        {(props) => (
          <PacientesScreen {...props} route={{ params: { token, usuario } }} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Perfil">
        {(props) => (
          <PerfilScreen {...props} usuario={usuario} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Autorizaciones"
          component={AutorizacionesScreen}
          options={{
            title: "Autorizaciones",
            headerStyle: { backgroundColor: "#0F6E56" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
