// app/(app)/index.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, Image,
    TouchableOpacity, // Se precisar de um botão de tentar novamente
    ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Para pegar o token
import { intervalToDuration } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useFonts } from 'expo-font';
import { getItem } from '../../context/AuthContext';
import { saveItem } from '../../context/AuthContext';

// --- Configuração da API (EXEMPLOS - SUBSTITUA!) ---
const API_CALCULO_BASE_URL = 'https://calculadoraprev.vercel.app/api/';
const CADASTRO_KEY = 'user-cadastro'; // Nova chave para armazenar o CADASTRO
const PRODUTO_KEY = 'user-produto'; // Nova chave para armazenar o PRODUTO
const DETALHES_KEY = 'detalhe-produto'; // Nova chave para armazenar o PRODUTO
// ----------------------------------------------------

// --- Tipos para os dados esperados---
export type UserDetails = {
    id: number;
    cpf: string;
    nome: string;
    dataNascimento: Date;
};

export type PensionData = {
    matricula: string;
    modalidade: Modalidade;
    regimeTributario: RegimeTributario;
    saldo: Saldo;
    beneficio: Beneficio;
};

type Modalidade = {
    parametro: string;
    codigo: number;
    descricao: string;
};
type RegimeTributario = {
    codigo: number;
    descricao: string;
};
type Saldo = {
    valor: number;
    referencia: string;
};
type Beneficio = {
    dataInicio: string;
    valor: string;
};

type MotivoTermino = {
    code: string;
    description: string;
    dataTermino: string;
    saldoRemanescente: number;
    idadeTermino: number;
};

type ProjecaoItem = {
    mesAno: string;
    idadeCliente: number;
    saldoInicial: number;
    beneficioBruto: number;
    beneficioPago: number;
    juros: number;
    saldoFinal: number;
}

type ProjecaoData = {
    projecao: ProjecaoItem[];
    motivoTermino: MotivoTermino;
};
// ---------------------------------------------------------


// --- Cores do Protótipo ---
const PRIMARY_COLOR = '#3C2E88'; // Roxo/Azul escuro
const LOADING_BACKGROUND_COLOR = '#f0f4f7'; // Cinza claro
// --- Cores e Constantes ---
const SECONDARY_COLOR = '#E33E5A'; // Rosa Vivest (para ícones/notificação?)
const BACKGROUND_COLOR = '#f8f9fa'; // Fundo geral levemente cinza
const CARD_BACKGROUND = '#ffffff';
const TEXT_COLOR_DARK = '#343a40';
const TEXT_COLOR_LIGHT = '#303030';
const TEXT_COLOR_PRIMARY = PRIMARY_COLOR;
const HIGHLIGHT_BACKGROUND = '#f1f3f5'; // Fundo cinza claro para caixas internas
const YELLOW_BULLET = '#ffc107';
const RED_BULLET = '#dc3545';
const GREEN_BULLET = '#00BE69';
// -------------------------

// --- Função Helper para Formatar Moeda ---
export const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "R$ --";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função que retorna a diferença percentual entre 2 valores
function calcularVariacaoPercentual(valorInicial: number, valorFinal: number): number {
    // Caso especial: Se o valor inicial for 0
    if (valorInicial === 0) {
      // Se o valor final também for 0, não houve variação.
      if (valorFinal === 0) {
        return 0; // Ou pode-se considerar NaN ou lançar erro dependendo do contexto
      }
      // Se o valor final for diferente de 0, a variação percentual é infinita.
      // Lançar um erro é geralmente a melhor abordagem neste caso.
      throw new Error("Não é possível calcular a variação percentual quando o valor inicial é zero e o valor final não é.");
      // Alternativamente, poderia retornar Infinity ou -Infinity:
      // return valorFinal > 0 ? Infinity : -Infinity;
    }
  
    // Calcula a diferença entre os valores
    const diferenca = valorFinal - valorInicial;
  
    // Calcula a variação como uma proporção do valor inicial
    const variacaoProporcional = diferenca / valorInicial;
  
    // Converte a proporção para percentual (multiplicando por 100)
    const variacaoPercentual = variacaoProporcional * 100;
  
    return variacaoPercentual;
  }



export default function HomeScreen(): JSX.Element {
    const { userCpf, session } = useAuth(); // Pega o token/sessão do contexto
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [pensionData, setPensionData] = useState<PensionData | null>(null);
    const [projecaoDetails, setProjecaoDetails] = useState<ProjecaoData | null>(null);
    const [plano, setPlano] = useState<String | null>(null);
    const [userIdade, setUserIdade] = useState<number | null>(null);
    useFonts({
        'Campton-Bold': require('../../assets/fonts/Campton-Bold.otf'),
        'Campton-Medium': require('../../assets/fonts/Campton-Medium.otf'),
        'Campton-Black': require('../../assets/fonts/Campton-Black.otf'),
        'Campton-Book': require('../../assets/fonts/Campton-Book.otf'),
        'OpenSans-Bold': require('../../assets/fonts/OpenSans-Bold.ttf'),
        'OpenSans-Regular': require('../../assets/fonts/OpenSans-Regular.ttf'),
        'OpenSans-SemiBold': require('../../assets/fonts/OpenSans-SemiBold.ttf')
      });

    // Função para buscar os dados sequencialmente
    const fetchData = async () => {
      if (!session) {
          setError("Sessão inválida. Por favor, faça login novamente.");
          setIsLoading(false);
          console.error("Tentativa de buscar dados sem sessão.");
          return;
      }

      setIsLoading(true);
      setError(null);
      // Limpa dados anteriores antes de buscar novos
      setUserDetails(null);
      setPensionData(null);
      setProjecaoDetails(null);

      try {
        // 1. Fetch Dados do Usuário e Produto armazenados localmente
          const fetchedUserDetails = await getItem(CADASTRO_KEY);
          
          const objUserDetails: UserDetails = JSON.parse(fetchedUserDetails!);
          const fetchedUserProduto = await getItem(PRODUTO_KEY);
          const objUserProduto = JSON.parse(fetchedUserProduto!);
          setPlano(objUserProduto.nomePlano);          
          setUserDetails(objUserDetails);

        // 2. Consulta detalhe produto e atualiza valor na variável pensionData
        const objPlanoRequest = {
          cpf: objUserDetails.cpf.trim(),     // Envia o CPF sem espaços extras
          empresa: objUserProduto.codigoEmpresa,
          matricula: objUserProduto.matricula.toString(),
          codPlano: objUserProduto.codigoPlano
        }
        console.log(objPlanoRequest);

        const responseDetalhe = await fetch(API_CALCULO_BASE_URL+'dados-previdencia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Indica que estamos enviando JSON
            'Accept': 'application/json',       // Indica que esperamos JSON de volta
          },
          body: JSON.stringify(objPlanoRequest),
        });

        const responseBodyDetalhe: PensionData = await responseDetalhe.json(); // Tenta parsear o corpo como JSON
        console.log(responseBodyDetalhe);
        

        setPensionData(responseBodyDetalhe);
        saveItem(DETALHES_KEY, JSON.stringify(responseBodyDetalhe));
        // 3. Calcular Idade atual do usuário
          const duracao = intervalToDuration({
            start: objUserDetails.dataNascimento,
            end: new Date(),
          });
          setUserIdade(duracao.years ?? 0); // Retorna 0 se duracao.years for undefined (não deve acontecer com datas válidas)
        // --------------------------------------------------------------
        // 4. Buscar Projeção do Benefício ---
        const saldo = responseBodyDetalhe?.saldo.valor;
        let tipoPagamento = '';
        let saldoMinimo = 0;
        switch (responseBodyDetalhe?.modalidade.codigo) {
            case 39:
            case 40:
            case 42:
                tipoPagamento = 'PERCENTUAL_SALDO_ANUAL';
                break;
            case 43:
            case 44:
            case 46:
                tipoPagamento = 'PRAZO_DEFINIDO';
                break;
            case 66:
            case 67:
            case 68:
                tipoPagamento = 'VALOR_FIXO';
                saldoMinimo = Number(responseBodyDetalhe.beneficio.valor);
                break;
            default:
                break;
        }
        const paramPagamento = Number(responseBodyDetalhe?.modalidade.parametro);

        console.log('saldo: ' + saldo + ' / tipo: ' + tipoPagamento + ' / param: ' + paramPagamento);

        const dadosSimulacao = {
            saldoAcumuladoInicial: saldo,
            dataInicioBeneficio: new Date(),
            dataNascimentoCliente: new Date(objUserDetails.dataNascimento),
            percentualRentabilidadeAnual: 4.5,
            saldoMinimo: saldoMinimo,
            idadeMaxima: 100,
            tipoPagamento: tipoPagamento,
            parametroPagamento: paramPagamento
        };

        const projecaoResponse = await fetch(`${API_CALCULO_BASE_URL}simular-evolucao`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosSimulacao), // Converte os dados para JSON
        });

        if (!projecaoResponse.ok) {
            const errorBody = await projecaoResponse.text();
            console.error(`Erro ${projecaoResponse.status} ao fazer projeção:`, errorBody);
            throw new Error(`Falha ao fazer projeção (Status: ${projecaoResponse.status})`);
        }

        const resultProjecao: ProjecaoData = await projecaoResponse.json();
        setProjecaoDetails(resultProjecao); // Atualiza o estado com os dados da projecao


        console.log("Busca de dados sequencial concluída com sucesso.");
        

      } catch (err: any) {
          console.error("Erro durante a busca sequencial de dados:", err);
          // Define a mensagem de erro para ser exibida na UI
          setError(err.message || "Ocorreu um erro ao consultar seus dados. Tente novamente.");
      } finally {
          // Garante que o loading termine
          setIsLoading(false);
          console.log("Finalizando estado de loading.");
      }
  };

    // useEffect para disparar a busca de dados quando o componente montar (e a sessão existir)
    useEffect(() => {
        console.log("HomeScreen montado/sessão mudou. Sessão:", session ? "Presente" : "Ausente");
        if (session) {
            fetchData();
        } else {
             // Se não houver sessão ao montar (improvável devido ao AuthContext, mas seguro verificar)
             setIsLoading(false);
             setError("Não autenticado.");
             console.log("Componente montado sem sessão, não buscará dados.");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]); // Depende da sessão. Se a sessão mudar (ex: re-login), busca novamente.

    // -------- RENDERIZAÇÃO CONDICIONAL --------

    // 1. Estado de Carregamento (conforme protótipo)
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingSafeArea}>
                <View style={styles.loadingContainer}>
                    {/* Certifique-se que o caminho para a imagem está correto! */}
                    <Image
                        source={require('../../assets/images/lupa.png')}
                        style={styles.loadingIcon}
                    />
                    <Text style={styles.loadingText}>
                        Aguarde enquanto realizamos a projeção do seu benefício...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // 2. Estado de Erro
    if (error) {
        return (
            <SafeAreaView style={styles.errorSafeArea}>
                <View style={styles.errorContainer}>
                     {/* Ícone opcional para erro */}
                     {/* <Ionicons name="alert-circle-outline" size={60} color="red" /> */}
                    <Text style={styles.errorTitle}>Ocorreu um Erro</Text>
                    <Text style={styles.errorDetails}>{error}</Text>
                    {/* Botão para tentar novamente */}
                    <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // 3. Estado de Sucesso (Conteúdo Principal)

    // --- Tela Principal (Dashboard) ---
    return (
        <SafeAreaView style={styles.mainSafeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* --- Mensagem de Boas Vindas --- */}
                <Text style={styles.welcomeText}>
                    Olá, {userDetails?.nome.split(' ', 1) || 'Usuário'}!
                </Text>

                {/* --- Card Meu Benefício --- */}
                <View style={styles.card}>
                    <View style={styles.cardTitleContainer}>
                        <Image source={require('../../assets/images/carteira.png')} style={styles.iconCard} />
                        <Text style={styles.cardTitle}>Meu benefício</Text>
                    </View>
                    <View style={styles.cardPaddingLg}>
                        <Text style={styles.cardSubtitle}>{plano || 'Plano não informado'}</Text>
                    </View>

                    <View style={styles.cardPaddingLg}>
                        <Text style={styles.label}>Saldo atualizado</Text>
                        <Text style={styles.valueLarge}>{formatCurrency(pensionData?.saldo.valor)}</Text>
                    </View>
                    <View style={styles.cardPaddingLg}>
                        <Text style={styles.label}>Último Benefício</Text>
                        <Text style={styles.valueLarge}>{formatCurrency(Number(pensionData?.beneficio.valor))}</Text>
                    </View>
                        <View style={styles.highlightBox}>
                        <Text style={styles.label}>Forma de recebimento atual</Text>
                        {(pensionData?.modalidade.codigo == 40 || pensionData?.modalidade.codigo == 42 || pensionData?.modalidade.codigo == 39) &&
                        <Text style={styles.valueMediumBold}>
                            Percentual do saldo: {pensionData?.modalidade.parametro.toString().replace(/\./g, ',')} %
                        </Text>
                        }
                        {(pensionData?.modalidade.codigo == 43 || pensionData?.modalidade.codigo == 44 || pensionData?.modalidade.codigo == 46) &&
                        <Text style={styles.valueMediumBold}>
                            Prazo certo: {pensionData?.modalidade.parametro.toString().replace(/\./g, ',')} anos
                        </Text>
                        }
                        {(pensionData?.modalidade.codigo == 66 || pensionData?.modalidade.codigo == 67 || pensionData?.modalidade.codigo == 68) &&
                        <Text style={styles.valueMediumBold}>
                            Valor em reais: {formatCurrency(Number(pensionData?.modalidade.parametro))}
                        </Text>
                        }
                    </View>
                    <Text style={styles.referenceText}>
                        Data de referência dos dados: 07/05/2025
                    </Text>
                </View>

                {/* --- Card Diagnóstico do seu Benefício --- */}
                {projecaoDetails && ( // Só mostra este card se tiver dados da projeção
                    <View style={styles.card}>
                        <View style={styles.cardTitleContainer}>
                          <Image source={require('../../assets/images/diagnostico.png')} style={styles.iconCard} />
                            <Text style={styles.cardTitle}>Diagnóstico do seu benefício</Text>
                        </View>
                        <Text style={styles.cardDescription}>
                            Realizamos simulações e analisamos a situação do seu benefício no futuro, veja os resultados:
                        </Text>

                        {/* Item Diagnóstico 1 */}
                        <View style={styles.diagnosisItem}>
                            <View style={[styles.bulletPoint, { backgroundColor: YELLOW_BULLET }]} />
                            <View style={styles.diagnosisTextContainer}>
                                <Text style={styles.label}>Previsão de esgotamento do saldo</Text>
                                <Text style={styles.valueMediumBold}>{projecaoDetails.motivoTermino.dataTermino}</Text>
                            </View>
                        </View>
                        {/* Item Diagnóstico 2 */}
                         <View style={styles.diagnosisItem}>
                            <View style={[styles.bulletPoint, { backgroundColor: YELLOW_BULLET }]} />
                            <View style={styles.diagnosisTextContainer}>
                                <Text style={styles.label}>Você continua recebendo por</Text>
                                <Text style={styles.valueMediumBold}>mais {projecaoDetails.motivoTermino.idadeTermino - Number(userIdade)} anos</Text>
                            </View>
                        </View>
                        {/* Item Diagnóstico 3 */}
                         <View style={styles.diagnosisItem}>
                             <View style={[styles.bulletPoint, { backgroundColor: YELLOW_BULLET }]} />
                             <View style={styles.diagnosisTextContainer}>
                                 <Text style={styles.label}>Saldo remanescente ao término do benefício</Text>
                                 <Text style={styles.valueMediumBold}>{formatCurrency(projecaoDetails.motivoTermino.saldoRemanescente)}</Text>
                             </View>
                         </View>
                         {/* Item Diagnóstico 4 */}
                         {calcularVariacaoPercentual(Number(pensionData?.beneficio.valor), Number(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)) < 0 &&
                         <View style={[styles.diagnosisItem, styles.diagnosisItemHighlight]}>
                             <View style={[styles.bulletPoint, { backgroundColor: RED_BULLET }]} />
                             <View style={styles.diagnosisTextContainer}>
                                 <Text style={styles.label}>O valor em reais do benefício diminui com o tempo</Text>
                                 <View style={styles.valueComparisonContainer}>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em 2025: {formatCurrency(Number(pensionData?.beneficio.valor))}</Text>
                                    </View>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em {projecaoDetails.motivoTermino.dataTermino}: {formatCurrency(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)}</Text>
                                    </View>
                                 </View>
                                  <View style={styles.decreaseContainer}>
                                        <Feather name="trending-down"  size={20} color={RED_BULLET} />
                                        <Text style={styles.percentageTextDecrease}>benefício diminui</Text>
                                        <Text style={styles.percentageTextDecrease}>{calcularVariacaoPercentual(Number(pensionData?.beneficio.valor), Number(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)).toFixed(2)}%</Text>
                                    </View>
                             </View>
                         </View>
                        }
                        {calcularVariacaoPercentual(Number(pensionData?.beneficio.valor), Number(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)) == 0 &&
                        <View style={[styles.diagnosisItem, styles.diagnosisItemHighlight]}>
                             <View style={[styles.bulletPoint, { backgroundColor: GREEN_BULLET }]} />
                             <View style={styles.diagnosisTextContainer}>
                                 <Text style={styles.label}>O valor em reais do benefício se mantém estável!</Text>
                                 <View style={styles.valueComparisonContainer}>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em 2025: {formatCurrency(Number(pensionData?.beneficio.valor))}</Text>
                                    </View>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em {projecaoDetails.motivoTermino.dataTermino}: {formatCurrency(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)}</Text>
                                    </View>
                                 </View>
                                <Text style={styles.label}>A sua forma de recebimento atual garante estabilidade no valor recebido.</Text>
                             </View>
                         </View>
                         }
                         {calcularVariacaoPercentual(Number(pensionData?.beneficio.valor), Number(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)) > 0 &&
                        <View style={[styles.diagnosisItem, styles.diagnosisItemHighlight]}>
                             <View style={[styles.bulletPoint, { backgroundColor: YELLOW_BULLET }]} />
                             <View style={styles.diagnosisTextContainer}>
                                 <Text style={styles.label}>O valor em reais do benefício vai aumentar com o tempo</Text>
                                 <View style={styles.valueComparisonContainer}>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em 2025: {formatCurrency(Number(pensionData?.beneficio.valor))}</Text>
                                    </View>
                                    <View style={styles.valueComparisonRow}>
                                        <Text style={styles.valueHighlight}>Em {projecaoDetails.motivoTermino.dataTermino}: {formatCurrency(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)}</Text>
                                    </View>
                                 </View>
                                 <View style={styles.decreaseContainer}>
                                        <Feather name="trending-up"  size={20} color={YELLOW_BULLET} />
                                        <Text style={styles.percentageTextIncrease}>benefício aumenta</Text>
                                        <Text style={styles.percentageTextIncrease}>{calcularVariacaoPercentual(Number(pensionData?.beneficio.valor), Number(projecaoDetails.projecao.findLast((element) => true)?.beneficioPago)).toFixed(2)}%</Text>
                                    </View>
                                <Text style={styles.label}>Na sua forma de renda, os valores de benefício tendem a aumentar conforme o tempo.</Text>
                             </View>
                         </View>
                         }
                        <Text style={styles.cardDescription}>
                            Para visualizar como melhorar a situação da sua renda, você pode fazer simulações:
                        </Text>

                        {/* Botão Simular */}
                        {/* Use Link para navegação baseada em rota do Expo Router */}
                            <TouchableOpacity style={styles.simulateButton}>
                                <Text style={styles.buttonText}>Simulador de renda</Text>
                                <Ionicons name="arrow-forward-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                            </TouchableOpacity>
                        {/* Se precisar de navegação programática: */}
                        {/* <TouchableOpacity style={styles.simulateButton} onPress={() => router.push('/(app)/simulation')}> ... </TouchableOpacity> */}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// -------- ESTILOS --------
const styles = StyleSheet.create({
    // --- Estilos Gerais, Loading, Erro (Copie do exemplo anterior) ---
    loadingSafeArea: { flex: 1, backgroundColor: LOADING_BACKGROUND_COLOR },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, },
    loadingIcon: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 35, },
    loadingText: { fontSize: 18, color: PRIMARY_COLOR, textAlign: 'center', lineHeight: 26, fontFamily: 'OpenSans-Regular'},
    errorSafeArea: { flex: 1, backgroundColor: '#fff0f0' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    errorTitle: { fontSize: 22, color: '#cc0000', marginBottom: 15, fontFamily: 'OpenSans-Regular' },
    errorDetails: { fontSize: 16, color: '#cc0000', textAlign: 'center', marginBottom: 30, fontFamily: 'OpenSans-Regular'},
    retryButton: { backgroundColor: PRIMARY_COLOR, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, fontFamily: 'OpenSans-Regular'},
    retryButtonText: { color: '#ffffff', fontSize: 16, fontFamily: 'OpenSans-Bold'},
    mainSafeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    // --- Header ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: CARD_BACKGROUND, // Ou BACKGROUND_COLOR se preferir
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerLogo: {
        height: 30, // Ajuste
        width: 100, // Ajuste
        resizeMode: 'contain',
    },
    notificationButton: {
        position: 'relative', // Para posicionar o badge
        padding: 5,
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: SECONDARY_COLOR, // Cor do badge
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: CARD_BACKGROUND,
    },
    notificationBadgeText: {
        color: CARD_BACKGROUND,
        fontSize: 10,
        fontFamily: 'OpenSans-Bold'
    },

    // --- Conteúdo Scroll ---
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    welcomeText: {
        fontSize: 22,
        fontFamily: 'Campton-Bold',
        fontWeight: 'bold',
        color: TEXT_COLOR_PRIMARY,
        marginBottom: 25,
        marginLeft: 5, // Pequeno ajuste de alinhamento
    },

    // --- Estilos de Card ---
    card: {
        backgroundColor: CARD_BACKGROUND,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        // Sombras (ajuste conforme necessário)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1, // Linha separadora sutil
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    cardIcon: {
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: TEXT_COLOR_PRIMARY,
        marginRight: 8,
        fontFamily: 'OpenSans-Bold'
    },
    cardSubtitle: {
        fontSize: 14,
        color: TEXT_COLOR_LIGHT,
        fontFamily: 'OpenSans-Regular'
    },
    cardDescription: {
        fontSize: 14,
        color: TEXT_COLOR_DARK,
        lineHeight: 20,
        marginBottom: 15,
        fontFamily: 'OpenSans-Regular'
    },

    // --- Card Meu Benefício Específico ---
    benefitColumnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Ou space-around
        marginBottom: 20,
        marginTop: 10,
    },
    column: {
        flex: 1, // Divide o espaço igualmente
        alignItems: 'flex-start', // Alinha texto à esquerda na coluna
        paddingHorizontal: 5, // Pequeno espaço entre colunas
    },
    label: {
        fontSize: 13,
        color: TEXT_COLOR_LIGHT,
        marginBottom: 4,
        fontFamily: 'OpenSans-Regular'
    },
    valueLarge: {
        fontSize: 20, // Tamanho grande para valores principais
        color: TEXT_COLOR_DARK,
        fontFamily: 'OpenSans-Bold'
    },
    highlightBox: {
        backgroundColor: HIGHLIGHT_BACKGROUND,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    valueMediumBold: {
        fontSize: 15,
        color: TEXT_COLOR_DARK,
        fontFamily: 'OpenSans-Bold'
    },
     referenceText: {
        fontSize: 12,
        color: TEXT_COLOR_LIGHT,
        textAlign: 'center',
        marginTop: 5,
        fontFamily: 'OpenSans-Regular'
    },

    // --- Card Diagnóstico Específico ---
    diagnosisItem: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Alinha bullet com a primeira linha de texto
        backgroundColor: HIGHLIGHT_BACKGROUND,
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
    },
     diagnosisItemHighlight: { // Para o item com mais detalhes
         // Pode ter um fundo ligeiramente diferente ou borda se quiser destacar mais
     },
    bulletPoint: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
        marginTop: 4, // Ajuste para alinhar com a primeira linha de texto
    },
    diagnosisTextContainer: {
        flex: 1, // Ocupa o restante do espaço
    },
    valueComparisonRow: {
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: 5, // Espaço entre as linhas de comparação
         fontWeight: 600,
         fontFamily: 'OpenSans-Bold'
     },
     valueComparisonContainer: {
        marginVertical: 25, // Espaço entre as linhas de comparação
    },
    valueSmall: {
        fontSize: 14,
        color: TEXT_COLOR_DARK,
        fontFamily: 'OpenSans-Regular'
    },
    valueHighlight: {
        fontSize: 16,
        color: TEXT_COLOR_DARK,
        fontFamily: 'OpenSans-Bold'
    },
    decreaseContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         marginLeft: 15, // Espaço à esquerda da seta/texto
         paddingBottom: 8,
         paddingTop: 16
     },
    percentageTextDecrease: {
         fontSize: 13,
         color: RED_BULLET,
         marginLeft: 5,
        fontFamily: 'OpenSans-Regular'
     },
     percentageTextIncrease: {
        fontSize: 13,
        color: TEXT_COLOR_DARK,
        marginLeft: 5,
       fontFamily: 'OpenSans-Regular'
    },

    // --- Botão Simular ---
    simulateButton: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 8,
        paddingVertical: 14,
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        marginRight: 8, // Espaço antes do ícone
        fontFamily: 'OpenSans-Bold'
    },
    buttonIcon: {
        // Nenhum estilo extra necessário geralmente
    },
    cardPaddingLg: {
        paddingTop: 8,
        paddingBottom: 8
    },
    iconCard: {
        height: 40,
        width: 40,
        marginRight: 10
    }
});