import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // Importa o componente Link para navegação

export default function SimuladoresHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela Stack 1 (Início)</Text>
      {/* Use o componente Link para navegar para outras telas no mesmo stack */}
      {/* O href é o caminho RELATIVO dentro do diretório atual ou absoluto a partir de /app */}
      <Link href="/simuladores/simuladorInteligente" asChild>
        <Button title="Ir para Simulador Inteligente" />
      </Link>
      <Link href="/simuladores/simuladorCompleto" asChild>
        <Button title="Ir para Simulador Completo" />
      </Link>
      {/* Ou usando caminho relativo: */}
      {/* <Link href="telaStack2" asChild>
        <Button title="Ir para Tela Stack 2 (relativo)" />
      </Link> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15 },
  title: { fontSize: 20, marginBottom: 15 },
});