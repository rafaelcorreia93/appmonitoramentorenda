// app/(app)/services.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Rive from 'rive-react-native';

export default function ServicesScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Mais Serviços</Text>
                <Text>Conteúdo da tela de mais serviços aqui...</Text>
            </View>
        </SafeAreaView>
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