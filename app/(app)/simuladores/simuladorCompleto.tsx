import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, 
    SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router'; // useRouter para navegação imperativa (opcional)
import { getItem } from '@/context/AuthContext';
const DETALHES_KEY = 'detalhe-produto'; // Nova chave para armazenar o PRODUTO
const CADASTRO_KEY = 'user-cadastro'; // Nova chave para armazenar o CADASTRO
import { formatCurrency, PensionData,UserDetails } from '../../(app)/index';
import PercentageSelector from '@/components/PercentageSelector';
import { Feather } from '@expo/vector-icons';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import CurrencyInput from '@/components/CurrencyInput';
import { TextInputMask } from 'react-native-masked-text';
import IntegerInput from '@/components/IntegerInput';
const API_CALCULO_BASE_URL = 'https://calculadoraprev.vercel.app/api/';
import CollapsibleSelect, { SelectOption } from '@/components/CollapsibleSelect';
import BalanceWithWithdrawal from '@/components/BalanceWithWithdrawal';

// Interface para dados de projecao
interface ProjecaoResults {
  projecao: ProjecaoItem[];
  motivoTermino: ProjecaoMotivoTermino;
}
interface ProjecaoItem {
  mesAno: string;
  idadeCliente: number;
  saldoInicial: number,
  beneficioBruto: number,
  beneficioPago: number,
  juros: number,
  saldoFinal: number
}
interface ProjecaoMotivoTermino {
  code: string;
  idadeTermino: number;
  dataTermino: string;
  description: string;
  saldoRemanescente: number;
}

interface ParametroSimulacao {
  tipoRenda: string;
  parametroRenda: number;
  descRenda: string;
}

 // Define your options - Use MaterialCommunityIcons names
const incomeOptions: SelectOption[] = [
    {
      id: 'VALOR_FIXO',
      iconName: 'dollar-sign', // Example icon
      title: 'Renda em valor fixo (R$)',
      description: 'Você simula por um valor em reais que vai receber de benefício todo mês, esse valor não muda',
    },
    {
      id: 'PERCENTUAL_SALDO_ANUAL',
      iconName: 'percent', // Example icon
      title: 'Renda em percentual do saldo',
      description: 'Você simula por um percentual que vai ser descontado do seu saldo todo mês',
    },
    {
      id: 'PRAZO_DEFINIDO',
      iconName: 'calendar', // Example icon
      title: 'Renda em prazo certo',
      description: 'Você simula por um prazo (em anos) que deseja manter o benefício',
    },
  ];

export default function SimuladorCompletoScreen() {
    const [saldoSimulacao, setSaldoSimulacao] = useState<number>(0);
  const router = useRouter(); // Hook para navegação programática
  const [selectedPercentage, setSelectedPercentage] = useState<number>(1);
  const [selectedPrazo, setSelectedPrazo] = useState<number | null>(null);
  const [selectedRentabilidade, setSelectedRentabilidade] = useState<number>(4.5);
  const [dadosDetalhe, setDadosDetalhe] = useState<PensionData | null>(null);
  const [dadosCadastro, setDadosCadastro] = useState<UserDetails | null>(null);
  const [dadosResultado, setDadosResultado] = useState<ProjecaoItem[] | null>(null);
  const [valorRenda, setValorRenda] = useState<number | undefined>(undefined);
  // State to hold the selected option's ID
  const [selectedIncomeType, setSelectedIncomeType] = useState<string | number | null>(null);
  const [resumoResultado, setResumoResultado] = useState<ProjecaoMotivoTermino | null>(null);
  const [parametroSimulacao, setParametroSimulacao] = useState<ParametroSimulacao | null>(null);
  

  // Estado para indicar o carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para armazenar possíveis erros
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<boolean>(false);

  const handleWithdrawalUpdate = (percentage: number | null) => {
    const valorResgate = Number(dadosDetalhe?.saldo.valor) * (Number(percentage)/100);
    
    setSaldoSimulacao(Number(dadosDetalhe?.saldo.valor) - valorResgate);
  }

  // useEffect para buscar os dados quando o componente montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true); // Inicia o carregamento
        setError(null); // Limpa erros anteriores

        // 1. Tenta buscar o item do Storage
        const storedDetalhesString = await getItem(DETALHES_KEY);

        // 2. Verifica se algo foi encontrado
        if (storedDetalhesString !== null) {
          // 3. Parseia a string JSON de volta para um objeto
          const parsedDetalhes = JSON.parse(storedDetalhesString);
          setDadosDetalhe(parsedDetalhes); // Atualiza o estado com os dados
        } else {
          // Se não encontrou nada, define um valor padrão ou mantém null
          console.log('Nenhum detalhe encontrado no Storage.');
          // setUserPrefs({ theme: 'light', notificationsEnabled: true }); // Exemplo de valor padrão
        }

        // 1. Tenta buscar o item do Storage
        const storedCadastroString = await getItem(CADASTRO_KEY);

        // 2. Verifica se algo foi encontrado
        if (storedCadastroString !== null) {
          // 3. Parseia a string JSON de volta para um objeto
          const parsedCadastro = JSON.parse(storedCadastroString);
          setDadosCadastro(parsedCadastro); // Atualiza o estado com os dados
        } else {
          // Se não encontrou nada, define um valor padrão ou mantém null
          console.log('Nenhum cadastro encontrado no Storage.');
          // setUserPrefs({ theme: 'light', notificationsEnabled: true }); // Exemplo de valor padrão
        }
      } catch (e: any) {
        // 4. Captura erros (leitura ou parse)
        console.error("Erro ao carregar dados do Storage:", e);
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

  // Função que será passada para o CurrencyInput para receber o valor
  const handleValorChange = (novoValorCentavos: number | undefined) => {
    console.log('Valor numérico recebido (centavos):', novoValorCentavos);
    setValorRenda(novoValorCentavos);
  };

  const handleSubmit = async (): Promise<void> => { // Tipo de retorno void
    // Alert.alert('Formulário Enviado', `Percentual Selecionado: ${selectedPercentage}%` + `Rentabilidade: ${selectedRentabilidade}%`);
    setResults(true);
    // Lógica de envio do formulário aqui
    let parametro;
    let tipoRenda;
    let descRenda;
    switch (selectedIncomeType) {
        case 'VALOR_FIXO':
            parametro = valorRenda;
            descRenda = 'Valor em Reais';
            tipoRenda = 'VALOR_FIXO';
        break;
        case 'PERCENTUAL_SALDO_ANUAL':
            parametro = selectedPercentage;
            descRenda = 'Percentual do Saldo';
            tipoRenda = 'PERCENTUAL_SALDO_ANUAL';
        break;
        case 'PRAZO_DEFINIDO':
            parametro = selectedPrazo;
            descRenda = 'Prazo Definido'
            tipoRenda = 'PRAZO_DEFINIDO';
        break;
    
        default:
            break;
    }
    console.log(valorRenda);
    
    // Consulta projeção do Benefício com os dados do Simulador
    const objProjecaoRequest = {
      saldoAcumuladoInicial: saldoSimulacao == 0 ? dadosDetalhe?.saldo.valor : saldoSimulacao,
      dataInicioBeneficio: new Date(),
      dataNascimentoCliente: dadosCadastro?.dataNascimento,
      percentualRentabilidadeAnual: selectedRentabilidade,
      saldoMinimo: dadosDetalhe?.beneficio.valor,
      idadeMaxima: 110,
      tipoPagamento: selectedIncomeType,
      parametroPagamento: parametro
    }
    console.log('params ' + objProjecaoRequest);
    if (typeof tipoRenda === 'string' && typeof descRenda === 'string') {
      setParametroSimulacao({ tipoRenda: tipoRenda ,parametroRenda: Number(parametro), descRenda: descRenda });
    }
    
    const responseProjecao = await fetch(API_CALCULO_BASE_URL+'simular-evolucao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indica que estamos enviando JSON
        'Accept': 'application/json',       // Indica que esperamos JSON de volta
      },
      body: JSON.stringify(objProjecaoRequest),
    });

    const responseBodyProjecao: ProjecaoResults = await responseProjecao.json(); // Tenta parsear o corpo como JSON
    setDadosResultado(responseBodyProjecao.projecao);
    setResumoResultado(responseBodyProjecao.motivoTermino);
    console.log(responseBodyProjecao.motivoTermino);
    
    
  };
  const handleClear = (): void => { // Tipo de retorno void
    setResults(false);
    // Lógica de envio do formulário aqui
  };

  // Função de callback tipada
  const handlePercentageChange = (value: number): void => {
    setSelectedPercentage(value);
  };
  // Função de callback tipada
  const handleRentabilidadeChange = (value: number): void => {
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
            <BalanceWithWithdrawal
            initialBalance={Number(dadosDetalhe?.saldo.valor)}
            maxWithdrawalPercentage={25} // Set the max % from your prototype
            onWithdrawalChange={handleWithdrawalUpdate} // Optional callback
             // containerStyle={{ marginTop: 10 }} // Example custom style
            />
          <View style={styles.cardController}>
          <CollapsibleSelect
            label="Selecione o tipo de renda"
            options={incomeOptions}
            selectedValue={selectedIncomeType}
            onValueChange={(value) => {
                console.log('Selected Income Type:', value);
                setSelectedIncomeType(value);
            }}
            // Optional: Customize colors if defaults don't match perfectly
            // iconColor="#5E35B1"
            // optionIconColor="#E53935"
            />
          </View>

          {selectedIncomeType === 'VALOR_FIXO' &&  /* Componente Valor em Reais */
            <CurrencyInput
            label="Valor em Reais"
            // initialValue={5000} // Ex: Para iniciar com R$ 50,00 (5000 centavos) - Opcional
            onChangeValue={handleValorChange} // Passa a função de callback
            placeholder="Digite o valor" // Você pode sobrescrever o placeholder padrão
            // style={{ backgroundColor: '#f5f5f5' }} // Exemplo de estilo customizado
            />
          }
          {selectedIncomeType === 'PERCENTUAL_SALDO_ANUAL' &&  /* Componente Percentual */
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
          }
          {selectedIncomeType === 'PRAZO_DEFINIDO' &&  /* Componente Prazo */
          <IntegerInput
            label="Prazo em anos"
            value={selectedPrazo}
            onChangeValue={setSelectedPrazo} // Passa a função de atualização do estado
            minValue={5} // Exemplo: Mínimo 1 ano
            maxValue={25} // Exemplo: Máximo 50 anos
            placeholder="5 a 25 anos"
            // Pode adicionar a formatação "anos" externamente ou ajustar o componente
            // Para exibir "XX anos" como na imagem, é mais complexo dentro do TextInput
            // pois o value precisa ser string. Uma alternativa é usar um Text ao lado.
            // A implementação atual foca em ter o NÚMERO puro.
            />
          }


        {/* {Componente de Rentabilidade} */}
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
          {parametroSimulacao &&
          <View style={styles.cardController}>
            <Text style={styles.label}>Parâmetros de Simulação</Text>
            <Text style={styles.label}>Tipo de Renda: {parametroSimulacao?.descRenda}</Text>
            <Text style={styles.label}>Parâmetro de Renda: 
            {parametroSimulacao.tipoRenda === 'VALOR_FIXO' && ' ' + formatCurrency(parametroSimulacao?.parametroRenda) + ' Reais'}
            {parametroSimulacao.tipoRenda === 'PERCENTUAL_SALDO_ANUAL' && ' ' +  parametroSimulacao?.parametroRenda + ' %'}
            {parametroSimulacao.tipoRenda === 'PRAZO_CERTO' && ' ' + parametroSimulacao?.parametroRenda + ' Anos'}
            </Text>
          </View>
          }

          {(resumoResultado && dadosResultado) && 
          <View style={styles.cardController}>
            <View style={styles.terminoItem}>
              <Text style={styles.terminoItemLabel}>Benefício Inicial</Text>
              <Text style={styles.terminoItemText}>{formatCurrency(dadosResultado[0].beneficioPago)}</Text>
            </View>
            <View style={styles.terminoItem}>
              <Text style={styles.terminoItemLabel}>Data Prevista de Término do Benefício</Text>
              <Text style={styles.terminoItemText}>{resumoResultado?.dataTermino}</Text>
            </View>
            <View style={styles.terminoItem}>
              <Text style={styles.terminoItemLabel}>Idade ao terminar benefício</Text>
              <Text style={styles.terminoItemText}>{resumoResultado?.idadeTermino}</Text>
            </View>
            <View style={styles.terminoItem}>
              <Text style={styles.terminoItemLabel}>Motivo</Text>
              <Text style={styles.terminoItemText}>{resumoResultado?.description}</Text>
            </View>
            <View style={styles.terminoItem}>
              <Text style={styles.terminoItemLabel}>Saldo Remanescente</Text>
              <Text style={styles.terminoItemText}>{formatCurrency(resumoResultado?.saldoRemanescente)}</Text>
            </View>
          </View>
          }

            <TimeSeriesChart dataList={dadosResultado} />
            
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
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD', // Cor da borda cinza claro (similar ao protótipo)
    borderRadius: 8,       // Bordas arredondadas (similar ao protótipo)
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 20,          // Tamanho da fonte dentro do input (ajuste conforme necessário)
    fontWeight: 'bold',   // Texto em negrito (similar ao protótipo)
    color: '#333',        // Cor do texto digitado
    textAlign: 'center',   // Centraliza o texto (similar ao protótipo)
    backgroundColor: '#fff', // Fundo branco
    fontFamily: 'OpenSans-Regular'
  },
  label: {
    fontSize: 16,
    color: '#333', // Cor do texto do label
    marginBottom: 8, // Espaçamento entre label e input
    fontFamily: 'OpenSans-Regular'
  },
  terminoItem: {
    marginBottom: 22,
  },
  terminoItemLabel: {
    fontSize: 16,
    color: '#333', // Cor do texto do label
    fontFamily: 'OpenSans-Regular'
  },
  terminoItemText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    color: '#333'
  }
});