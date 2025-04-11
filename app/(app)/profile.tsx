// app/(app)/profile.tsx
import React from 'react';
import {
    View, Text, StyleSheet, SafeAreaView,
    TouchableOpacity, // Para o botão de logout
    Alert
} from 'react-native';
// import { Stack } from 'expo-router'; // Não precisamos mais do Stack aqui (a menos que queira um header específico)
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de logout

// ... (função formatCpf e estilos anteriores)

export default function ProfileScreen() {
    const { userCpf, signOut } = useAuth(); // Pega a função signOut

    const handleLogout = () => {
        Alert.alert(
            "Confirmar Saída",
            "Tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: signOut } // Chama signOut ao confirmar
            ]
        );
    };

     // ... (função formatCpf) ...
    // const formatCpf = (cpf: string | null | undefined): string => { /* ... */ };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Perfil</Text>

                {/* Botão de Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#dc3545" style={{ marginRight: 10 }}/>
                    <Text style={styles.logoutButtonText}>Sair do Aplicativo</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

// Adicione os estilos para o botão de logout aos styles existentes
const styles = StyleSheet.create({
    // ... (todos os estilos anteriores: safeArea, container, title, infoContainer, label, value, infoText)
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 20, },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#4a3a8f', },
    infoContainer: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', },
    label: { fontSize: 16, fontWeight: 'bold', color: '#495057', marginRight: 10, },
    value: { fontSize: 16, color: '#212529', flex: 1, },
    infoText: { marginTop: 20, fontSize: 16, textAlign: 'center', color: '#6c757d', },

    // --- Estilos para o botão de logout ---
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40, // Mais espaço acima
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f8d7da', // Fundo vermelho claro
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5c6cb', // Borda vermelha clara
    },
    logoutButtonText: {
        color: '#721c24', // Texto vermelho escuro
        fontSize: 16,
        fontWeight: 'bold',
    },
});