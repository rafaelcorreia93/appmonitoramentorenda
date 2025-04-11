// app/(app)/_layout.tsx
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import { Ionicons } from '@expo/vector-icons'; // Exemplo de ícone
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

// --- Cores e Constantes ---
const PRIMARY_COLOR = '#3C2E88'; // Roxo/Azul escuro
const SECONDARY_COLOR = '#E33E5A'; // Rosa Vivest (para ícones/notificação?)
const CARD_BACKGROUND = '#ffffff';
const INACTIVE_COLOR = '#505050'; // Cinza para inativos
const TAB_BAR_BACKGROUND = '#ffffff';
// --- Tipo para as props do tabBarIcon ---
type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};
export default function AppLayout() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SECONDARY_COLOR, // Cor do ícone e texto ativo
        tabBarInactiveTintColor: INACTIVE_COLOR, // Cor do ícone e texto inativo
        tabBarStyle: {
          backgroundColor: TAB_BAR_BACKGROUND, // Fundo da tab bar
          borderTopWidth: 1, // Linha superior sutil
          borderTopColor: '#e0e0e0',
          height: 90, // Altura da tab bar (ajuste se necessário)
          paddingBottom: 5, // Espaçamento inferior dentro da tab bar
          paddingTop: 5, // Espaçamento superior dentro da tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12, // Tamanho da fonte dos labels
        },
        headerShown: false,
      }}
    >
        {/* Aba Início */}
        <Tabs.Screen
          // O nome DEVE corresponder ao nome do arquivo: index.tsx
          name="index"
          options={{
            title: 'Início', // Texto exibido na tab
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Feather name={'home'} size={size} color={color} />
            ),
          }} />
          {/* Aba Simulador */}
        <Tabs.Screen
          // O nome DEVE corresponder ao nome do arquivo
          name="simuladores"
          options={{
            title: 'Simulador', // Texto exibido na tab
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Feather name={'sliders'} size={size} color={color} />
            ),
          }} />

        {/* Aba Mais Serviços */}
        <Tabs.Screen
          // Nome corresponde a services.tsx
          name="services"
          options={{
            title: 'Mais Serviços',
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              // Ícone de "grid" ou "apps"
              <Feather name={'grid'} size={size} color={color} />
            ),
          }} />

        {/* Aba Perfil */}
        <Tabs.Screen
          // Nome corresponde a profile.tsx
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <Feather name={'user'} size={size} color={color} />
            )
          }} />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative', // Para posicionar o badge
    padding: 5,
},
notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: SECONDARY_COLOR, // Cor do badge
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BACKGROUND,
},
notificationBadgeText: {
    color: CARD_BACKGROUND,
    fontSize: 10,
    fontWeight: 'bold',
},
headerLogo: {
  height: 30, // Ajuste
  width: 100, // Ajuste
  resizeMode: 'contain',
}
});