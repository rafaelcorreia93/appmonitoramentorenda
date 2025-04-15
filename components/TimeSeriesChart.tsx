import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
// Não precisamos mais de AbstractChartProps aqui se definirmos as estruturas nós mesmos

// Interface para os dados de entrada
interface FinancialData {
  mesAno: string;
  idadeCliente: number;
  saldoInicial: number;
  beneficioBruto: number;
  beneficioPago: number;
  juros: number;
  saldoFinal: number;
}

// Props do componente
interface TimeSeriesChartProps {
  dataList: FinancialData[] | null | undefined;
}

// Tipos de gráficos disponíveis
type ChartType = 'beneficio' | 'saldo';

const CHART_TYPES: Record<string, ChartType> = {
  BENEFICIO: 'beneficio',
  SALDO: 'saldo',
};

// --- Novas Interfaces Corrigidas ---

// Interface para um único conjunto de dados (uma linha no gráfico)
interface Dataset {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
    // Adicione outras propriedades de dataset válidas se necessário (ex: propsForDots)
}

// Interface para o objeto de dados que o useMemo vai retornar
// Contém os labels e os dois possíveis conjuntos de datasets
interface ProcessedChartData {
    labels: string[];
    datasetsBeneficio: Dataset[]; // Array de datasets para beneficio
    datasetsSaldo: Dataset[];    // Array de datasets para saldo
}

// --- Fim das Novas Interfaces ---


const formatCurrency = (value: number | undefined | null): string => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Exibir sempre 2 casas decimais nos detalhes
};

// Função para formatar números grandes no eixo Y (AJUSTADA)
const formatYLabel = (yValue: string | number): string => {
    const num = typeof yValue === 'string' ? parseFloat(yValue) : yValue;
    if (isNaN(num)) return '';

    if (num >= 1000000) { // Milhões (M)
        // Mantém 1 casa decimal para milhões (ex: 2.1M)
        return `R$ ${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) { // Milhares (K)
        // *** ALTERAÇÃO AQUI: Usa toFixed(1) para maior precisão ***
        // Ex: 43150.83 => 43.15083 => toFixed(1) => 43.2 => R$ 43.2K
        return `R$ ${(num / 1000).toFixed(1)}K`;
    }

    // Para valores menores que 1000:
    // Opção 1: Mostrar como fração de K (ex: 0.5K para 500) - mantém consistência K/M
    return `R$ ${(num / 1000).toFixed(1)}K`;

    // Opção 2: Mostrar o valor completo (descomente se preferir)
    // return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

// Interface para os dados do ponto selecionado
interface SelectedPointData {
    index: number;
    value: number; // O valor do ponto clicado (pode ser Saldo ou Benefício)
    year: string;
    preciseSaldo: number;
    preciseBeneficio: number; // Benefício do primeiro mês daquele ano
}


const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ dataList }) => {
    const [activeChart, setActiveChart] = useState<ChartType>(CHART_TYPES.BENEFICIO);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedPointData, setSelectedPointData] = useState<SelectedPointData | null>(null);

    // 1. Agregação Anual (como antes)
    const aggregatedChartData = useMemo((): ProcessedChartData => {
        // ... (Lógica de agregação anual do useMemo anterior) ...
        // Retorna { labels: yearlyLabels, datasetsBeneficio: [...], datasetsSaldo: [...] }
        const emptyResult: ProcessedChartData = {
            labels: [],
            datasetsBeneficio: [{ data: [] }],
            datasetsSaldo: [{ data: [] }],
        };

        if (!dataList || dataList.length === 0) {
            return emptyResult;
        }

        const yearlyData: Record<string, FinancialData[]> = {};
        for (const item of dataList) {
            try {
                const year = item.mesAno.split('/')[1];
                if (year) {
                    if (!yearlyData[year]) {
                        yearlyData[year] = [];
                    }
                    yearlyData[year].push(item);
                } else {
                     console.warn(`Formato de mesAno inválido: ${item.mesAno}`);
                }
            } catch (e) {
                console.error(`Erro ao processar mesAno ${item.mesAno}:`, e);
                continue;
            }
        }

        const sortedYears = Object.keys(yearlyData).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

        if (sortedYears.length === 0) {
            return emptyResult;
        }

        const yearlyLabels: string[] = [];
        const yearlyBeneficio: number[] = [];
        const yearlySaldo: number[] = [];

        for (const year of sortedYears) {
            const monthsData = yearlyData[year];
            if (!monthsData || monthsData.length === 0) continue;

            yearlyLabels.push(year); // Label é o ano

            monthsData.sort((a, b) => { // Ordena os meses dentro do ano
                try {
                    const [monthA] = a.mesAno.split('/');
                    const [monthB] = b.mesAno.split('/');
                    return parseInt(monthA, 10) - parseInt(monthB, 10);
                } catch {
                    return 0;
                }
            });

            const saldoInicialAno = monthsData[0]?.saldoInicial ?? 0;
            yearlySaldo.push(saldoInicialAno);
            const beneficioPrimeiroMesAno = monthsData[0]?.beneficioPago ?? 0; // Pega benefício do primeiro mês
            yearlyBeneficio.push(beneficioPrimeiroMesAno);
        }

        return {
            labels: yearlyLabels,
            datasetsBeneficio: [{ data: yearlyBeneficio, color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, strokeWidth: 2 }],
            datasetsSaldo: [{ data: yearlySaldo, color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, strokeWidth: 2 }],
        };
    }, [dataList]);    

    // 2. Filtragem Dinâmica Baseada na Largura da Tela
    const screenWidth = Dimensions.get('window').width;
    const chartPadding = 32; // Padding horizontal total do container do gráfico (16 + 16)
    const availableChartWidth = screenWidth - chartPadding;
    const minPixelsPerPoint = 55; // ** AJUSTE ESTE VALOR ** - Pixels mínimos por ponto/label no eixo X
                                  // Aumente para menos pontos, diminua para mais pontos.

    const finalChartData = useMemo((): ProcessedChartData => {
        const totalYears = aggregatedChartData.labels.length;
        if (totalYears <= 1) { // Se 0 ou 1 ponto, não há o que filtrar
            return aggregatedChartData;
        }

        // Garante pelo menos 2 pontos (início e fim) se a tela for muito estreita
        const maxPointsToShow = Math.max(2, Math.floor(availableChartWidth / minPixelsPerPoint));

        if (totalYears <= maxPointsToShow) {
            // Não precisa filtrar, cabem todos os pontos
            return aggregatedChartData;
        } else {
            // Precisa filtrar, selecionando pontos uniformemente espaçados
            const filteredLabels: string[] = [];
            const filteredBeneficio: number[] = [];
            const filteredSaldo: number[] = [];
            const step = (totalYears - 1) / (maxPointsToShow - 1); // Calcula o intervalo entre os pontos a serem selecionados

            for (let i = 0; i < maxPointsToShow; i++) {
                const index = Math.round(i * step); // Calcula o índice do ponto original a ser pego

                // Garante que o índice não ultrapasse os limites (pode acontecer devido a arredondamento)
                const safeIndex = Math.min(index, totalYears - 1);

                // Evita duplicados se o arredondamento levar ao mesmo índice (raro, mas possível)
                if (i > 0 && safeIndex === Math.round((i-1) * step)) {
                    continue;
                }


                filteredLabels.push(aggregatedChartData.labels[safeIndex]);
                // Acessa os dados dentro do primeiro (e único) dataset
                if (aggregatedChartData.datasetsBeneficio[0]?.data) {
                   filteredBeneficio.push(aggregatedChartData.datasetsBeneficio[0].data[safeIndex]);
                }
                 if (aggregatedChartData.datasetsSaldo[0]?.data) {
                   filteredSaldo.push(aggregatedChartData.datasetsSaldo[0].data[safeIndex]);
                 }
            }

             // Garante que o último ponto SEMPRE esteja incluído se foi pulado
             const lastOriginalIndex = totalYears - 1;
             if (Math.round((maxPointsToShow - 1) * step) < lastOriginalIndex) {
                 if(!filteredLabels.includes(aggregatedChartData.labels[lastOriginalIndex])) { // Verifica se já não foi incluído
                    filteredLabels.push(aggregatedChartData.labels[lastOriginalIndex]);
                    if (aggregatedChartData.datasetsBeneficio[0]?.data) {
                       filteredBeneficio.push(aggregatedChartData.datasetsBeneficio[0].data[lastOriginalIndex]);
                    }
                    if (aggregatedChartData.datasetsSaldo[0]?.data) {
                       filteredSaldo.push(aggregatedChartData.datasetsSaldo[0].data[lastOriginalIndex]);
                    }
                 }
             }


            return {
                labels: filteredLabels,
                // Recria os datasets com os dados filtrados
                datasetsBeneficio: [{
                    ...aggregatedChartData.datasetsBeneficio[0], // Mantém cor, etc.
                    data: filteredBeneficio
                }],
                datasetsSaldo: [{
                    ...aggregatedChartData.datasetsSaldo[0], // Mantém cor, etc.
                    data: filteredSaldo
                }],
            };
        }
    }, [aggregatedChartData, availableChartWidth, minPixelsPerPoint]); // Recalcula se os dados agregados ou a largura mudarem  
    
    // --- Handler para clique no ponto ---
    const handleDataPointClick = (data: { index: number; value: number; x: number; y: number }) => {
        const { index } = data;
        
        // Pega os dados correspondentes ao índice clicado a partir dos dados *finais* exibidos
        const year = finalChartData.labels[index];
        const preciseSaldo = finalChartData.datasetsSaldo[0]?.data[index];
        const preciseBeneficio = finalChartData.datasetsBeneficio[0]?.data[index]; // Benefício do primeiro mês

        if (year !== undefined && preciseSaldo !== undefined && preciseBeneficio !== undefined) {
            setSelectedPointData({
                index,
                value: data.value, // Valor formatado pelo eixo Y que foi clicado
                year,
                preciseSaldo,
                preciseBeneficio,
            });
            setIsDetailModalVisible(true); // Abre o modal
        } else {
             console.warn("Dados não encontrados para o ponto clicado:", data);
        }
    };
    // --- Fim do Handler ---

    // 3. Renderização usando os dados FINAIS (possivelmente filtrados)
    const currentDataset = activeChart === CHART_TYPES.BENEFICIO
        ? finalChartData.datasetsBeneficio
        : finalChartData.datasetsSaldo;

    const chartTitle = activeChart === CHART_TYPES.BENEFICIO
        ? 'Projeção do Benefício'
        : 'Projeção do Saldo';

    const chartConfig = { /* ... (configuração como antes) ... */
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: activeChart === CHART_TYPES.BENEFICIO ? '#007AFF' : '#34C759',
        },
    };

    // Verifica se há dados *após* a filtragem
    if (finalChartData.labels.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Carregando dados exibir o gráfico.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{chartTitle}</Text>

            <View style={styles.buttonContainer}>
                 {/* Botões (sem alterações) */}
                 <TouchableOpacity
                    style={[styles.button, activeChart === CHART_TYPES.BENEFICIO && styles.activeButton]}
                    onPress={() => setActiveChart(CHART_TYPES.BENEFICIO)} activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, activeChart === CHART_TYPES.BENEFICIO && styles.activeButtonText]}>
                        Benefício
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, activeChart === CHART_TYPES.SALDO && styles.activeButton]}
                    onPress={() => setActiveChart(CHART_TYPES.SALDO)} activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, activeChart === CHART_TYPES.SALDO && styles.activeButtonText]}>
                        Saldo
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Usa finalChartData aqui */}
            <LineChart
                data={{
                    labels: finalChartData.labels,
                    datasets: currentDataset,
                }}
                width={screenWidth - (chartPadding + 20)} // Usa a largura total menos padding
                height={250}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
                yAxisInterval={1}
                formatYLabel={formatYLabel}
                onDataPointClick={handleDataPointClick} // <--- ADICIONADO AQUI
                // Opcional: Ajustar estilo dos pontos clicáveis
                // propsForDots={{ r: "5", strokeWidth: "2" }} // Um pouco maior para facilitar o clique
                // Esconde pontos individuais se ficarem muitos? (Opcional)
                // withDots={finalChartData.labels.length < 15} // Exemplo: só mostrar pontos se forem menos de 15
                 // Rotação pode ser necessária se os anos ainda ficarem apertados
                // verticalLabelRotation={finalChartData.labels.length > 10 ? 30 : 0}
            />

            {/* --- Modal para exibir detalhes --- */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isDetailModalVisible}
                onRequestClose={() => setIsDetailModalVisible(false)} // Para botão voltar do Android
            >
                <TouchableWithoutFeedback onPress={() => setIsDetailModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            {/* Impede que o clique dentro do card feche o modal */}
                            <View style={styles.modalContent}>
                                {selectedPointData ? (
                                    <>
                                        <Text style={styles.modalTitle}>Detalhes - Ano {selectedPointData.year}</Text>
                                        <View style={styles.modalRow}>
                                            <Text style={styles.modalLabel}>Saldo Inicial:</Text>
                                            <Text style={styles.modalValue}>{formatCurrency(selectedPointData.preciseSaldo)}</Text>
                                        </View>
                                        <View style={styles.modalRow}>
                                            <Text style={styles.modalLabel}>Benefício (Início Ano):</Text>
                                            <Text style={styles.modalValue}>{formatCurrency(selectedPointData.preciseBeneficio)}</Text>
                                        </View>
                                        {/* Adicione mais detalhes se desejar */}
                                        <TouchableOpacity
                                             style={styles.closeButton}
                                             onPress={() => setIsDetailModalVisible(false)}
                                         >
                                             <Text style={styles.closeButtonText}>Fechar</Text>
                                         </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text>Carregando detalhes...</Text> // Fallback
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            {/* --- Fim do Modal --- */}
        </View>
    );
};

// Os estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: '#343a40',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#3C2E88',
  },
  buttonText: {
    color: '#515151',
    fontSize: 14,
    fontFamily: 'OpenSans-Regular'
  },
  activeButtonText: {
    color: '#ffffff',
    fontFamily: 'OpenSans-Bold'
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    padding: 20,
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular'
  },
      // --- Estilos do Modal ---
      modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semi-transparente
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        width: '80%', // Largura do modal
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center', // Centraliza conteúdo do modal
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Campton-Medium',
        marginBottom: 15,
        color: '#3C2E88',
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
        paddingHorizontal: 5, // Pequeno padding interno
    },
    modalLabel: {
        fontSize: 15,
        color: '#555',
        fontFamily: 'OpenSans-Regular',
    },
    modalValue: {
        fontSize: 15,
        color: '#111',
        fontFamily: 'OpenSans-Bold',
        textAlign: 'right',
    },
     closeButton: {
        marginTop: 20,
        backgroundColor: '#3C2E88',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    closeButtonText: {
        color: '#ffffff',
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
    },
    // --- Fim dos Estilos do Modal ---

});

export default TimeSeriesChart;