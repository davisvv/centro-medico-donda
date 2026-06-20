import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import PacientesScreen from "./screens/PacientesScreen";
import CitasScreen from "./screens/CitasScreen";
import AutorizacionesScreen from "./screens/AutorizacionesScreen";
import PerfilScreen from "./screens/PerfilScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { active: "home", inactive: "home-outline" },
  Citas:     { active: "calendar", inactive: "calendar-outline" },
  Pacientes: { active: "people", inactive: "people-outline" },
  Perfil:    { active: "person", inactive: "person-outline" },
};

function SplashScreen() {
  return (
    <View style={estilos.splash}>
      <View style={estilos.splashLogo}>
        <Text style={estilos.splashLogoTexto}>+</Text>
      </View>
      <Text style={estilos.splashTitulo}>Centro Médico DONDA</Text>
      <ActivityIndicator
        color="rgba(255,255,255,0.7)"
        size="small"
        style={{ marginTop: 40 }}
      />
    </View>
  );
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
        tabBarIcon: ({ focused }) => {
          const { active, inactive } = TAB_ICONS[tabRoute.name] ?? {};
          return (
            <Ionicons
              name={focused ? active : inactive}
              size={24}
              color={focused ? "#0F6E56" : "#9CA3AF"}
            />
          );
        },
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
  const [cargando, setCargando] = useState(true);
  const [sesionGuardada, setSesionGuardada] = useState(null);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const usuarioJSON = await AsyncStorage.getItem("usuario");
      if (token && usuarioJSON) {
        setSesionGuardada({ token, usuario: JSON.parse(usuarioJSON) });
      }
    } catch (e) {
      console.log("Error leyendo sesión:", e);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={sesionGuardada ? "Main" : "Login"}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          options={{ headerShown: false }}
        >
          {(props) => (
            <MainTabs
              {...props}
              route={{
                params: sesionGuardada ?? props.route.params,
              }}
            />
          )}
        </Stack.Screen>
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

const estilos = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0F6E56",
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  splashLogoTexto: { fontSize: 32, color: "#fff" },
  splashTitulo: { fontSize: 20, fontWeight: "600", color: "#fff" },
});
