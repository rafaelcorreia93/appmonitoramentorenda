import React from 'react';
import { Stack } from 'expo-router';

export default function SimuladoresLayout() {
  return (
    <Stack
      screenOptions={{
        // Opções padrão para as telas dentro deste stack
        // headerStyle: { backgroundColor: '#f4511e' },
        // headerTintColor: '#fff',
      }}
    >
      {/* Opcional: Você pode definir opções específicas por tela aqui também */}
      {/* Se não definir, ele usará o nome do arquivo como título inicial */}
      <Stack.Screen name="index" options={{ title: 'Simulador' }} />
      <Stack.Screen name="simuladorInteligente" options={{ title: 'Simulador Inteligente', headerBackTitle: 'Voltar' }} />
      <Stack.Screen name="simuladorCompleto" options={{ title: 'Simulador Completo', headerBackTitle: 'Voltar' }} />
    </Stack>
  );
}