// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Href, useRouter, useSegments } from 'expo-router'; // Import hooks do Expo Router
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { Platform } from 'react-native'; // Import Platform

const TOKEN_KEY = 'my-jwt'; // Chave para armazenar o token
const CPF_KEY = 'user-cpf'; // Nova chave para armazenar o CPF
const PRODUTO_KEY = 'user-produto'; // Nova chave para armazenar o PRODUTO
const CADASTRO_KEY = 'user-cadastro'; // Nova chave para armazenar o CADASTRO

// --- Funções auxiliares de armazenamento ---
// Abstrai a lógica de qual armazenamento usar

export async function saveItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
      // !! CUIDADO: localStorage (usado por AsyncStorage na web) NÃO é seguro !!
       console.warn(`Armazenando chave "${key}" no localStorage (web) - NÃO SEGURO para dados sensíveis.`);
      try {
          await AsyncStorage.setItem(key, value);
      } catch (e) {
          console.error(`Erro ao salvar ${key} no AsyncStorage (web):`, e);
      }
  } else {
      // Usa SecureStore em plataformas nativas (iOS/Android)
      try {
          await SecureStore.setItemAsync(key, value);          
      } catch (e) {
           console.error(`Erro ao salvar ${key} no SecureStore (native):`, e);
      }
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
      try {
          return await AsyncStorage.getItem(key);
      } catch (e) {
           console.error(`Erro ao ler ${key} do AsyncStorage (web):`, e);
           return null;
      }
  } else {
      try {
           // A função que você usava antes era getValueWithKeyAsync, mas a padrão é getItemAsync
           // Verifique se você estava usando alguma versão diferente ou se era só um typo.
           // A função padrão e mais comum é getItemAsync.
          return await SecureStore.getItemAsync(key);
      } catch (e) {
           console.error(`Erro ao ler ${key} do SecureStore (native):`, e);
           return null;
      }
  }
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
       try {
          await AsyncStorage.removeItem(key);
       } catch (e) {
           console.error(`Erro ao remover ${key} do AsyncStorage (web):`, e);
       }
  } else {
       try {
          await SecureStore.deleteItemAsync(key);
       } catch (e) {
           console.error(`Erro ao remover ${key} do SecureStore (native):`, e);
       }
  }
}

type AuthContextType = {
  signIn: (data: { token: string; cpf: string; produto: string; cadastro: string }) => void;
  signOut: () => void;
  session?: string | null; // Token (ou sessão)
  userCpf?: string | null; // Estado para armazenar o CPF carregado
  userProduto?: string | null; // Estado para armazenar o produto
  userCadastro?: string | null; // Estado para armazenar o cadastro
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<string | null>(null);
  const [userCpf, setUserCpf] = useState<string | null>(null); // Estado para CPF
  const [userProduto, setUserProduto] = useState<string | null>(null); // Estado para Produto
  const [userCadastro, setUserCadastro] = useState<string | null>(null); // Estado para Cadastro
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const segments = useSegments(); // Obtém os segmentos da rota atual

  // Efeito para carregar dados de autenticação (token E CPF)
  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true); // Garante que loading está true ao iniciar
      let token: string | null = null;
      let cpf: string | null = null;
      let produto: string | null = null;
      let cadastro: string | null = null;
      try {
        console.log(`Carregando dados de autenticação (Plataforma: ${Platform.OS})`);
        // Carrega ambos em paralelo usando a função auxiliar getItem
        [token, cpf, produto, cadastro] = await Promise.all([
          getItem(TOKEN_KEY),
          getItem(CPF_KEY),
          getItem(PRODUTO_KEY),
          getItem(CADASTRO_KEY)
        ]);

        if (token) {
          console.log("Token encontrado, definindo sessão.");
          setSession(token);
        } else {
          console.log("Nenhum token encontrado.");
          setSession(null);
        }
        if (cpf) {
             console.log("CPF encontrado, definindo usuário.");
             setUserCpf(cpf);
        } else {
             console.log("Nenhum CPF encontrado.");
             setUserCpf(null);
        }
        if (produto) {
            console.log("Produto encontrado.");
            setUserProduto(produto);
        } else {
            console.log("Nenhum produto encontrado.");
            setUserProduto(null);
        }
        if (cadastro) {
          console.log("Cadastro encontrado.");
          setUserCadastro(cadastro);
        } else {
            console.log("Nenhum Cadastro encontrado.");
            setUserCadastro(null);
        }
      } catch (e) {
        console.error("Erro ao carregar dados de autenticação:", e);
        setSession(null);
        setUserCpf(null);
        setUserProduto(null);
        setUserCadastro(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []); // Roda apenas na montagem inicial

  // Efeito para redirecionamento baseado na sessão e rota atual
  useEffect(() => {
    if (isLoading) return; // Não faz nada enquanto carrega

    const firstSegment = segments.length > 0 ? (segments[0] as string) : null;
    const inAuthGroup = firstSegment === '(auth)';

    console.log("Verificando redirecionamento:");
    console.log("Sessão:", session ? session.substring(0, 10) + "..." : "null");
    console.log("Está no grupo Auth?", inAuthGroup);
    console.log("Segmentos:", segments);

    if (!session && !inAuthGroup) {
      router.replace('/login' as Href);
    } else if (session && inAuthGroup) {
      // Se HÁ sessão e ESTÁ no grupo (auth) (ex: acabou de logar), redireciona para app
      console.log("Redirecionando para / (app index)");
      router.replace('/(app)' as Href); // Redireciona para a rota raiz do grupo (app)
    }
  }, [session, segments, isLoading, router]); // Re-executa quando a sessão, rota ou loading mudam

  // Funções signIn e signOut modificadas
  const authContextValue: AuthContextType = {
    signIn: async (data: { token: string; cpf: string; produto: string; cadastro: string }) => { // Aceita objeto com token e CPF
      try {
        console.log(`Salvando token e CPF (Plataforma: ${Platform.OS})`);
        // Armazena ambos em paralelo
        await Promise.all([
          saveItem(TOKEN_KEY, data.token),
          saveItem(CPF_KEY, data.cpf), // Armazena o CPF
          saveItem(PRODUTO_KEY, data.produto), // Armazena o CPF
          saveItem(CADASTRO_KEY, data.cadastro) // Armazena o CPF
        ]);
        console.log("Token e CPF salvos.");
        setSession(data.token);
        setUserCpf(data.cpf); // Atualiza o estado local do CPF também
        setUserProduto(data.produto) // Atualiza o estado local do Produto
        setUserCadastro(data.cadastro) // Atualiza o estado local do Cadastro
        return true;
        // Redirecionamento será tratado pelo useEffect acima
      } catch (e) {
         console.error("Erro ao salvar token/CPF:", e);
      }
    },
    signOut: async () => {
      try {
         // Remove ambos em paralelo
         await Promise.all([
            deleteItem(TOKEN_KEY),
            deleteItem(CPF_KEY), // Remove o CPF
            deleteItem(PRODUTO_KEY), // Remove o Produto
            deleteItem(CADASTRO_KEY) // Remove o Cadastro
         ]);
        console.log("Token e CPF removidos.");
        setSession(null);
        setUserCpf(null); // Limpa o estado local do CPF
        setUserProduto(null); // Limpa o estado local do CPF
        setUserCadastro(null); // Limpa o estado local do Cadastro
        // Redirecionamento será tratado pelo useEffect acima
      } catch (e) {
         console.error("Erro ao remover token/CPF:", e);
      }
    },
    session,
    userCpf,
    userProduto,
    userCadastro,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}