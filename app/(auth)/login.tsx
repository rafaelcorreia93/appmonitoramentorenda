// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity, Image,
    KeyboardAvoidingView, Platform, Alert, SafeAreaView,
    ActivityIndicator, Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho
import LoadingStepsScreen from '../../components/LoadingStepsScreen'; // Ajuste o caminho

// --- Constantes de estilo (como no exemplo anterior) ---
const PRIMARY_COLOR = '#4a3a8f';
const LIGHT_GRAY_BACKGROUND = '#f0f4f7';
const INPUT_BORDER_COLOR = '#cccccc';
const PLACEHOLDER_COLOR = '#aaaaaa';
const LABEL_COLOR = '#333333';
// --- ---

// -------- IMPORTANTE: Substitua pela URL da sua API --------
const API_LOGIN_URL = 'https://calculadoraprev.vercel.app/api/login';
const API_TOKEN = 'https://calculadoraprev.vercel.app/api/generateToken';
const API_CADASTRO = 'https://calculadoraprev.vercel.app/api/dados-cadastro';

// -----------------------------------------------------------
// Defina as etapas
const LOADING_STEPS = [
  'Validando suas credenciais',
  'Consultando seu plano de previdência',
  'Consultando seus dados pessoais',
  'Últimos preparativos...'
];
function LoginScreen(): JSX.Element {
  const [cpf, setCpf] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Estado para feedback de carregamento
  const { signIn } = useAuth(); // Pega a função signIn do contexto
  const [currentStep, setCurrentStep] = useState(0); // Começa na primeira etapa (índice 0)
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [hideForm, setHideForm] = useState<boolean>(false);

  /**
 * Remove todos os caracteres não numéricos de uma string (ideal para CPF, CNPJ, telefone, etc.).
 * Exemplo: "123.456.789-10 " => "12345678910"
 *
 * @param valor A string a ser limpa (pode conter pontos, traços, espaços, etc.).
 *              Pode ser string, null ou undefined.
 * @returns Uma string contendo apenas os dígitos, ou uma string vazia se a entrada
 *          for nula, indefinida ou não contiver dígitos.
 */
function removerNaoDigitos(valor: string | null | undefined): string {
  // 1. Verifica se o valor é nulo, indefinido ou uma string vazia.
  //    Se for, retorna uma string vazia para evitar erros.
  if (!valor) {
    return '';
  }

  // 2. Usa a expressão regular /\D/g para encontrar todos os caracteres não numéricos.
  //    \D - Corresponde a qualquer caractere que NÃO seja um dígito (0-9).
  //    g  - É uma flag "global", que garante que TODAS as ocorrências sejam
  //         substituídas, não apenas a primeira.
  const apenasDigitos = valor.replace(/\D/g, '');

  // 3. Retorna a string resultante contendo apenas dígitos.
  return apenasDigitos;
}

  // Função handleLogin agora é async para esperar a API
  const handleLogin = async (): Promise<void> => {
    // 1. Validação básica inicial
    const trimmedCpf = removerNaoDigitos(cpf); // Guarda o CPF limpo
    console.log('trimedCPF '+trimmedCpf);
    
    if (!trimmedCpf || !password.trim()) {
      Alert.alert('Entrada Inválida', 'Por favor, preencha o CPF e a senha.');
      return;
    }

      // -------- INICIA O LOADING --------
      setCurrentStep(0); // Garante que começa na primeira etapa do modal
      setIsLoggingIn(true);
      // ----------------------------------

    // 2. Iniciar feedback de carregamento
    setIsSubmitting(true);

    try {
      // 3. Montar a requisição para a API
      console.log(`Enviando para: ${API_LOGIN_URL}`);
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indica que estamos enviando JSON
          'Accept': 'application/json',       // Indica que esperamos JSON de volta
        },
        // Corpo da requisição com os dados do usuário
        // Adapte os nomes das chaves ('cpf', 'senha') se sua API esperar diferente
        body: JSON.stringify({
          cpf: trimmedCpf,      // Envia o CPF sem espaços extras
          senha: password       // Envia a senha (API deve usar HTTPS!)
          // Se sua API usa 'password' em vez de 'senha', mude aqui:
          // password: password
        }),
      });
      const responseBody = await response.json(); // Tenta parsear o corpo como JSON

      if (response.ok) { // Status na faixa 200-299 indica sucesso

        setCurrentStep(prevStep => prevStep + 1);
        // Realizar chamada para consultar dados de previdência e token
        // 4. Montar a requisição para a API
        console.log(`Enviando para: ${API_TOKEN}`);
        const responseToken = await fetch(API_TOKEN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Indica que estamos enviando JSON
            'Accept': 'application/json',       // Indica que esperamos JSON de volta
          },
          // Corpo da requisição com os dados do usuário
          // Adapte os nomes das chaves ('cpf', 'senha') se sua API esperar diferente
          body: JSON.stringify({
            cpf: trimmedCpf     // Envia o CPF sem espaços extras
          }),
        });

      const responseBodyToken = await responseToken.json(); // Tenta parsear o corpo como JSON
        console.log(responseBodyToken);
        
        // Verifica se o token esperado está presente na resposta
        if (responseBodyToken.token) {
          const token = responseBodyToken.token;
          const produtoObj = JSON.stringify(responseBodyToken.produto);

        setCurrentStep(prevStep => prevStep + 1);

          // Consulta de dados cadastrais
        console.log(`Enviando para: ${API_CADASTRO}`);
        const objCadastroRequest = {
          cpf: trimmedCpf,     // Envia o CPF sem espaços extras
          empresa: responseBodyToken.produto.codigoEmpresa,
          matricula: responseBodyToken.produto.matricula.toString(),
          codPlano: responseBodyToken.produto.codigoPlano
        }
        
        const responseCadastro = await fetch(API_CADASTRO, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Indica que estamos enviando JSON
            'Accept': 'application/json',       // Indica que esperamos JSON de volta
          },
          body: JSON.stringify(objCadastroRequest),
        });

      const responseBodyCadastro = await responseCadastro.json(); // Tenta parsear o corpo como JSON
      const cadastroObjString = JSON.stringify(responseBodyCadastro);
      console.log(responseBodyCadastro);
      
          setHideForm(true);
          // Chama a função signIn do contexto para salvar o token e navegar para início
          await signIn({ token: token, cpf: trimmedCpf, produto: produtoObj, cadastro: cadastroObjString });
          setCurrentStep(prevStep => prevStep + 1);
          // A navegação ocorrerá via useEffect no AuthContext
        } else {
          // API retornou 2xx mas não veio o token esperado
          console.error('Resposta OK, mas sem token:', responseBodyToken);
          Alert.alert('Erro Inesperado', 'Não foi possível obter o token de autenticação.');
          setIsLoggingIn(false); // Fecha o modal em caso de erro de token
        }
      } else {
        // Tratamento de erros da API (status não-OK)
        let errorMessage = 'CPF ou senha inválidos.'; // Mensagem padrão para 401/400
        if (responseBody && responseBody.message) {
           // Se a API envia uma mensagem de erro específica, use-a
           errorMessage = responseBody.message;
        } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'CPF ou senha incorretos.';
        } else if (response.status >= 500) {
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        }
        // Mostra o erro da API para o usuário
        Alert.alert('Falha no Login', errorMessage);
      }

    } catch (error: any) {
      // 5. Tratamento de erros de rede ou outros erros inesperados
      console.error('Erro durante a chamada de login:', error);
      let message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      // Tentar ser um pouco mais específico se for um erro conhecido
      if (error.message && error.message.includes('Network request failed')) {
        message = 'Falha na rede. Verifique sua conexão com a internet.';
      }
      Alert.alert('Erro de Conexão', message);
      setIsLoggingIn(false); // Fecha o modal em caso de erro de rede

    } finally {
      // 6. Finalizar feedback de carregamento (sempre executa)
      setIsSubmitting(false);
      setIsLoggingIn(false); // Fecha o modal em caso de erro de rede
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Restante do JSX da tela de login (igual ao exemplo anterior) */}
      {/* ... (copie o JSX de SafeAreaView até o fim do componente do exemplo anterior) ... */}
      {/* -------- Modal de Loading -------- */}
        <Modal
        transparent={true}
        animationType="slide" // ou "slide", "none"
        visible={isLoggingIn}
        onRequestClose={() => {
             // Opcional: Lógica para quando o usuário tenta fechar o modal (ex: botão voltar no Android)
             // Pode não ser ideal permitir fechar um modal de login em andamento.
             // console.log("Tentativa de fechar modal de login.");
        }}
      >
        <LoadingStepsScreen
            steps={LOADING_STEPS}
            currentStepIndex={currentStep}
            logoSource={require('../../assets/images/icon-vivest.png')} // <<< CERTIFIQUE-SE QUE ESTE CAMINHO ESTÁ CORRETO!
        />
      </Modal>
       <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoiding}
        >
            <View style={styles.container}>
                {/* --- Logo --- */}
                <Image
                    source={require('../../assets/images/vivest.png')} // Ajuste o caminho relativo
                    style={styles.logo}
                />
                {/* --- Texto de Boas-Vindas --- */}
                <Text style={styles.welcomeText}>
                    Bem-vindo(a)! Faça login com suas credenciais do portal Vivest
                </Text>
                <View>
                {!hideForm ? (
                    // Mostra o indicador de carregamento
                    <View style={styles.formLoginContainer}>
                    {/* --- Input CPF --- */}
                    <View style={styles.inputGroup} >
                        <Text style={styles.inputLabel}>CPF</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite aqui"
                            placeholderTextColor={PLACEHOLDER_COLOR}
                            value={cpf}
                            onChangeText={setCpf}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isSubmitting} // Desabilita enquanto carrega
                        />
                    </View>
                    {/* --- Input Senha --- */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite aqui"
                            placeholderTextColor={PLACEHOLDER_COLOR}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            editable={!isSubmitting} // Desabilita enquanto carrega
                        />
                    </View>
                    {/* --- Botão Entrar --- */}
                    {/* --- Botão Entrar com Feedback --- */}
                    <TouchableOpacity
                        // Estilo condicional para feedback visual e desabilitar clique
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isSubmitting} // Desabilita o botão durante a chamada
                    >
                        {isSubmitting ? (
                        // Mostra o indicador de carregamento
                        <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                        // Mostra o texto e ícone normais
                        <>
                            <Text style={styles.buttonText}>Entrar</Text>
                            <Text style={styles.buttonIcon}>→</Text>
                        </>
                        )}
                    </TouchableOpacity>
                    </View>
                    ) : (
                    // Mostra o texto e ícone normais
                    <>
                        <Text>Aguarde, redirecionando você...</Text>
                    </>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Estilos (copie os styles do exemplo anterior) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: LIGHT_GRAY_BACKGROUND },
    keyboardAvoiding: { flex: 1, },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20},
    logo: { width: 200, height: 80, resizeMode: 'contain', marginBottom: 25, alignSelf: 'center', },
    welcomeText: { fontSize: 16, color: PRIMARY_COLOR, textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 20},
    inputGroup: { width: '100%', marginBottom: 20, },
    inputLabel: { fontSize: 14, color: LABEL_COLOR, marginBottom: 8, alignSelf: 'flex-start', },
    input: { width: '100%', height: 50, backgroundColor: '#ffffff', borderWidth: 1, borderColor: INPUT_BORDER_COLOR, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, color: '#333333', },
    button: { width: '100%', height: 50, backgroundColor: PRIMARY_COLOR, borderRadius: 8, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, },
    buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', },
    buttonIcon: { color: '#ffffff', fontSize: 22, marginLeft: 10, fontWeight: 'bold', },
    buttonDisabled: {
        backgroundColor: '#a095cc', // Cor um pouco mais clara/cinza para indicar desabilitado
        elevation: 0, // Remove sombra quando desabilitado
    },
    formLoginContainer: {
      paddingHorizontal: 0
    }
});
// --- ---

export default LoginScreen;