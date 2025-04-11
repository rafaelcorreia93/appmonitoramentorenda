// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Pode adicionar opções de Stack aqui se necessário
  // O headerShown: false no RootLayout já esconde este,
  // mas pode ser útil se quiser um header *dentro* do fluxo de auth.
  return <Stack screenOptions={{ headerShown: false }} />;
}