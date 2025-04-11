// components/LoadingStepsScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    ActivityIndicator, // Para o spinner
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useFonts } from 'expo-font';

// --- Tipos para as Props ---
interface LoadingStepsScreenProps {
    steps: string[];             // Array com o texto de cada etapa
    currentStepIndex: number;    // Índice (0-based) da etapa atual (mostra spinner)
    logoSource: any;             // Source para a imagem do logo (ex: require('../assets/logo.png'))
}

// --- Constantes de Cor e Tamanho ---
const PRIMARY_COLOR = '#4a3a8f'; // Roxo/Azul escuro do spinner/logo
const COMPLETED_COLOR = '#28a745'; // Verde para checkmark
const LINE_COLOR = '#e0e0e0';      // Cinza claro para a linha conectora
const TEXT_COLOR_ACTIVE = '#343a40'; // Cor do texto para etapa ativa/completa
const TEXT_COLOR_PENDING = '#6c757d';// Cor do texto para etapas futuras (opcional)
const ICON_SIZE = 38;
const LOGO_HEIGHT = 50;

const LoadingStepsScreen: React.FC<LoadingStepsScreenProps> = ({
    steps,
    currentStepIndex,
    logoSource
}) => {
    useFonts({
        'Campton-Medium': require('../assets/fonts/Campton-Medium.otf'),
        });
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* --- Logo --- */}
                <Image source={logoSource} style={styles.logo} />

                {/* --- Container das Etapas --- */}
                <View style={styles.stepsContainer}>
                    {steps.map((stepText, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        // const isPending = index > currentStepIndex; // Se precisar diferenciar futuras

                        return (
                            <View key={index} style={styles.stepItemContainer}>
                                {/* Coluna do Ícone e Linha */}
                                <View style={styles.iconColumn}>
                                    {/* Linha conectora (não mostra acima do primeiro) */}
                                    {index > 0 && <View style={styles.lineConnectorTop} />}

                                    {/* Ícone (Check, Spinner ou Círculo) */}
                                    {isCompleted ? (
                                        <Feather name={'check-circle'} size={ICON_SIZE} color={COMPLETED_COLOR} />
                                    ) : isActive ? (
                                        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                                        // Note: 'large' spinner pode ser maior que ICON_SIZE, ajuste se necessário
                                        // ou use um ícone animado customizado
                                    ) : (
                                        // Estado pendente (ex: círculo cinza) - Opcional
                                        <View style={styles.pendingIcon} />
                                    )}

                                     {/* Linha conectora (não mostra abaixo do último) */}
                                    {index < steps.length - 1 && <View style={styles.lineConnectorBottom} />}
                                </View>

                                {/* Coluna do Texto */}
                                <View style={styles.textColumn}>
                                    <Text
                                        style={[
                                            styles.stepText,
                                            // Estilo diferente para etapas pendentes (opcional)
                                            // isPending ? styles.stepTextPending : null,
                                            // Pode adicionar estilo diferente para ativa também se quiser
                                            // isActive ? styles.stepTextActive : null
                                        ]}
                                    >
                                        {stepText}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    safeArea: {
        width: '100%',
        flex: 1,
        backgroundColor: '#f8f9fa', // Fundo geral
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center', // Centraliza o conteúdo verticalmente
        paddingHorizontal: 30,
    },
    logo: {
        height: LOGO_HEIGHT,
        resizeMode: 'contain',
        marginBottom: 60, // Mais espaço abaixo do logo
    },
    stepsContainer: {
        width: '100%', // Ocupa a largura disponível
        alignItems: 'stretch', // Estica os filhos (stepItemContainer)
    },
    stepItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Alinha topo do ícone com topo do texto
        marginBottom: 35, // Espaço entre as etapas
    },
    iconColumn: {
        alignItems: 'center', // Centraliza ícone/spinner horizontalmente
        marginRight: 15,       // Espaço entre coluna do ícone e coluna do texto
        // Tentar dar uma largura fixa pode ajudar no alinhamento das linhas
        width: ICON_SIZE + 10, // Largura do ícone + padding
        position: 'relative', // Necessário para posicionar as linhas
    },
    lineConnectorTop: {
        position: 'absolute',
        height: 40, // Altura da linha acima do ícone (ajuste conforme necessário)
        width: 2,
        backgroundColor: LINE_COLOR,
        top: -(ICON_SIZE / 2 + 30), // Posiciona acima do centro do ícone (aproximado)
        left: (ICON_SIZE + 10) / 2 - 1, // Centraliza a linha na coluna
    },
    lineConnectorBottom: {
        // Ajuste a altura conforme necessário para conectar bem
        height: 35, // Altura da linha abaixo do ícone
        width: 2,
        backgroundColor: LINE_COLOR,
        // Não precisa de position absolute se estiver abaixo no fluxo normal
        // Mas se precisar controlar exato:
        // position: 'absolute',
        // top: ICON_SIZE, // Começa abaixo do ícone
        // left: (ICON_SIZE + 10) / 2 - 1,
    },
    pendingIcon: { // Estilo para o ícone pendente (se usar)
        width: ICON_SIZE - 4, // Pouco menor que o check/spinner
        height: ICON_SIZE - 4,
        borderRadius: (ICON_SIZE - 4) / 2,
        backgroundColor: '#ffffff', // Cinza claro
        borderWidth: 2,
        borderColor: PRIMARY_COLOR,
    },
    textColumn: {
        flex: 1, // Ocupa o restante do espaço na linha
        // Adiciona um padding top para alinhar melhor com o centro do ícone se necessário
    },
    stepText: {
        fontSize: 16,
        color: TEXT_COLOR_ACTIVE, // Cor padrão
        lineHeight: 22,
        fontFamily: 'Campton-Medium'
    },
    stepTextPending: { // Estilo opcional para texto pendente
        color: TEXT_COLOR_PENDING,
    },
    // stepTextActive: { // Estilo opcional para texto ativo
    //     fontWeight: 'bold',
    // },
});

export default LoadingStepsScreen;