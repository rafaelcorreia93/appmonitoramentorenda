import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // useRouter para navegação imperativa (opcional)
import { getItem } from '@/context/AuthContext';
const DETALHES_KEY = 'detalhe-produto'; // Nova chave para armazenar o PRODUTO
import { formatCurrency, PensionData } from '../../(app)/index';
import PercentageSelector from '@/components/PercentageSelector';
import { Feather } from '@expo/vector-icons';

export default function SimuladorCompletoScreen() {
  const router = useRouter(); // Hook para navegação programática
  const [selectedPercentage, setSelectedPercentage] = useState<number>(1);
  const [selectedRentabilidade, setSelectedRentabilidade] = useState<number>(4.5);
  const [dadosDetalhe, setDadosDetalhe] = useState<PensionData | null>(null);

  // Estado para indicar o carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para armazenar possíveis erros
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<boolean>(false);

  // useEffect para buscar os dados quando o componente montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true); // Inicia o carregamento
        setError(null); // Limpa erros anteriores

        // 1. Tenta buscar o item do AsyncStorage
        const storedDetalhesString = await getItem(DETALHES_KEY);

        // 2. Verifica se algo foi encontrado
        if (storedDetalhesString !== null) {
          // 3. Parseia a string JSON de volta para um objeto
          const parsedDetalhes = JSON.parse(storedDetalhesString);
          setDadosDetalhe(parsedDetalhes); // Atualiza o estado com os dados
        } else {
          // Se não encontrou nada, define um valor padrão ou mantém null
          console.log('Nenhum detalhe encontrado no AsyncStorage.');
          // setUserPrefs({ theme: 'light', notificationsEnabled: true }); // Exemplo de valor padrão
        }
      } catch (e: any) {
        // 4. Captura erros (leitura ou parse)
        console.error("Erro ao carregar dados do AsyncStorage:", e);
        setError("Falha ao carregar as preferências.");
      } finally {
        // 5. Finaliza o carregamento, independentemente de sucesso ou erro
        setIsLoading(false);
      }
    };

    loadData(); // Chama a função assíncrona

    // A função de cleanup não é estritamente necessária para getItem,
    // mas é bom saber que ela existe para operações mais complexas.
    // return () => { /* Código de limpeza, se necessário */ };
  }, []); // [] garante que o efeito rode apenas uma vez na montagem

  const handleSubmit = (): void => { // Tipo de retorno void
    // Alert.alert('Formulário Enviado', `Percentual Selecionado: ${selectedPercentage}%` + `Rentabilidade: ${selectedRentabilidade}%`);
    setResults(true);
    // Lógica de envio do formulário aqui
  };
  const handleClear = (): void => { // Tipo de retorno void
    setResults(false);
    // Lógica de envio do formulário aqui
  };

  // Função de callback tipada
  const handlePercentageChange = (value: number): void => {
    console.log("Novo valor recebido:", value);
    setSelectedPercentage(value);
  };
  // Função de callback tipada
  const handleRentabilidadeChange = (value: number): void => {
    console.log("Novo valor recebido:", value);
    setSelectedRentabilidade(value);
  };
  // --- Renderização Condicional ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }
  return (
    // SafeAreaView é bom para evitar que o conteúdo fique sob notches/barras
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {!results &&
          <View>
          <View style={styles.cardController}>
            <Text style={styles.saldo}>{formatCurrency(dadosDetalhe?.saldo.valor)}</Text>
          </View>
          <View style={styles.cardController}>
            <PercentageSelector
              label="Percentual do Saldo para Investir:"
              initialValue={selectedPercentage}
              onValueChange={handlePercentageChange}
              minValue={0}
              maxValue={2}
              step={0.01}
            />
          </View>

          <View style={styles.cardController}>
          <PercentageSelector
            label="Percentual de Rentabilidade:"
            initialValue={selectedRentabilidade}
            onValueChange={handleRentabilidadeChange}
            minValue={4.5}
            maxValue={6.5}
            step={0.1}
          />
          </View>

          <TouchableOpacity style={styles.simulateButton} onPress={handleSubmit} >
              <Text style={styles.buttonText}>Simular</Text>
              <Feather name="arrow-right"  size={22} color={'#fff'} />
          </TouchableOpacity>
        </View>
        }
        {
          results && <View>
            <Text>Resultados</Text>
            <TouchableOpacity style={styles.simulateButton} onPress={handleClear} >
              <Text style={styles.buttonText}>Voltar a simulação</Text>
          </TouchableOpacity>
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ocupa toda a tela
  },
  formContainer: {
    flexGrow: 1, // Permite que o ScrollView cresça se necessário
    padding: 20,
    // justifyContent: 'center', // Centraliza se houver pouco conteúdo
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
  cardController: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20
  },
  saldo: {
    fontSize: 22,
    textAlign: 'center'
  },
    simulateButton: {
      backgroundColor: '#3C2E88',
      borderRadius: 8,
      paddingVertical: 14,
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  buttonText: {
      color: '#ffffff',
      fontSize: 22,
      marginRight: 8, // Espaço antes do ícone
      fontFamily: 'Campton-Medium'
  },
});