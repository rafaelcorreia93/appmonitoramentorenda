// app/_layout.tsx
import React from 'react';
import { Stack, Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Ajuste o caminho
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Componente interno para acessar o contexto após o Provider
function InitialLayout() {
  const { isLoading, session } = useAuth();

  // Mostra um loading enquanto a sessão é verificada
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a3a8f" />
      </View>
    );
  }

  // Renderiza o conteúdo (Stack Navigator gerenciado pelo Expo Router)
  // O redirecionamento é feito pelo useEffect dentro do AuthProvider
  return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* As telas dentro dos grupos (auth) e (app) serão gerenciadas aqui */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f4f7', // Mesma cor de fundo da tela de login
    },
  });