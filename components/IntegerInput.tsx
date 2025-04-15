// src/components/IntegerInput.tsx
import React, { useState, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Keyboard,
} from 'react-native';

interface IntegerInputProps {
  label: string;
  value: number | null; // O valor controlado pelo componente pai
  onChangeValue: (value: number | null) => void; // Função para notificar o pai da mudança
  minValue?: number;
  maxValue?: number;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  // Você pode adicionar outras props do TextInput que desejar expor, como onBlur, onFocus, etc.
}

const IntegerInput: React.FC<IntegerInputProps> = ({
  label,
  value,
  onChangeValue,
  minValue,
  maxValue,
  placeholder = "Digite apenas números", // Placeholder padrão
  containerStyle,
  labelStyle,
  inputStyle,
}) => {
  // Estado interno para controlar o texto *dentro* do TextInput (que é sempre string)
  const [internalText, setInternalText] = useState<string>('');

  // Efeito para sincronizar o estado interno quando o 'value' prop mudar externamente
  useEffect(() => {
    // Converte o valor numérico (ou null) do pai para string para o TextInput
    const stringValue = value !== null ? String(value) : '';
    // Só atualiza o texto interno se for diferente, para evitar loops e perda de foco
    if (stringValue !== internalText) {
        setInternalText(stringValue);
    }
    // Atenção: Não colocar internalText nas dependências para evitar loop
  }, [value]);

  const handleTextChange = (text: string) => {
    // 1. Remove qualquer caractere não numérico
    const cleanedText = text.replace(/[^0-9]/g, '');

    // Atualiza o estado interno para que o usuário veja o que digitou (após limpeza)
    setInternalText(cleanedText);

    // 2. Tenta converter para número
    if (cleanedText === '') {
      // Se o campo está vazio, o valor é null
      onChangeValue(null);
    } else {
      const numericValue = parseInt(cleanedText, 10);

      // Verifica se é um número válido (embora a regex já ajude muito)
      if (!isNaN(numericValue)) {
        // 3. Valida os limites mínimo e máximo (se definidos)
        let finalValue: number | null = numericValue;

        if (minValue !== undefined && numericValue < minValue) {
           // Opção 1: Considerar inválido se for menor que o mínimo
           // onChangeValue(null);
           // return;
           // Opção 2: Travar no mínimo (pode ser feito no onBlur ou aqui)
           // Por enquanto, notificamos o valor digitado, a validação final pode ser do form
           // Vamos optar por notificar null se estiver fora dos limites estritos
           finalValue = null;
        }

        if (maxValue !== undefined && numericValue > maxValue) {
          // Opção 1: Considerar inválido
          finalValue = null;
          // Opção 2: Travar no máximo (pode ser feito no onBlur ou aqui)
          // Vamos optar por notificar null
        }

         // 4. Notifica o componente pai com o valor numérico válido (ou null se inválido/fora dos limites)
        onChangeValue(finalValue);

      } else {
        // Caso raro (NaN após limpeza), notifica como null
        onChangeValue(null);
      }
    }
  };

  // Opcional: Formatar/Validar no onBlur para garantir que o valor final exibido
  // corresponda ao estado numérico e limites (ex: remover 0 à esquerda, travar min/max)
  const handleBlur = () => {
     if (value !== null) {
        let correctedValue = value;
        if (minValue !== undefined && correctedValue < minValue) {
           correctedValue = minValue; // Trava no mínimo ao sair
           onChangeValue(correctedValue); // Atualiza o pai
        }
         if (maxValue !== undefined && correctedValue > maxValue) {
           correctedValue = maxValue; // Trava no máximo ao sair
           onChangeValue(correctedValue); // Atualiza o pai
        }
         // Atualiza o texto interno para refletir o valor final (removendo zeros à esquerda etc.)
        setInternalText(String(correctedValue));
     } else {
         // Se o valor no pai é null, garante que o campo fique vazio ao sair
         setInternalText('');
     }
     // Fecha o teclado se estiver aberto
     // Keyboard.dismiss(); // Descomente se desejar fechar o teclado no blur
  };


  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        // Mostra o teclado numérico
        keyboardType="numeric"
        // Controla o texto exibido com o estado interno
        value={internalText}
        // Manipulador de mudança de texto
        onChangeText={handleTextChange}
        // Placeholder
        placeholder={placeholder}
        // Manipulador de perda de foco (opcional, para formatação/validação final)
        onBlur={handleBlur}
        // Outras props úteis
        // maxLength={...} // Se quiser limitar o número de dígitos
        // returnKeyType="done" // Pode ser útil em formulários
        // onSubmitEditing={Keyboard.dismiss} // Fecha o teclado ao pressionar "done"
      />
      {/* Você pode adicionar uma Text para mostrar mensagens de erro aqui */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // Espaçamento entre inputs
  },
  label: {
    fontSize: 16,
    color: '#333', // Cor do texto do label
    marginBottom: 8, // Espaçamento entre label e input
    fontFamily: 'OpenSans-Regular'
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
    fontFamily: 'OpenSans-Regular',
    height: 50
  },
});

export default IntegerInput;