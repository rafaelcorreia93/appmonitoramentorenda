import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router'; // useRouter para navegação imperativa (opcional)

export default function SimuladorInteligenteScreen() {
  const router = useRouter(); // Hook para navegação programática

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulador Inteligente</Text>
      <Button title="Voltar (programático)" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center', // Centraliza o placeholder
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4a3a8f', // Cor primária
    },
});