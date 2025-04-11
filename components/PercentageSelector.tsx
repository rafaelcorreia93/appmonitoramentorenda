import React, { useState, useEffect, FC, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Slider from '@react-native-community/slider';
import { useFonts } from 'expo-font';

// --- Constantes de Estilo ---
const PRIMARY_COLOR = '#3C2E88'; // Roxo escuro (ajuste conforme necessário)
const SECONDARY_COLOR = '#e0e0e0'; // Cinza claro para a trilha inativa
const BORDER_COLOR = '#b0b0b0'; // Cor da borda do input

// --- Tipos para as Props ---
interface PercentageSelectorProps {
  label?: string; // Label opcional, com valor padrão
  initialValue?: number; // Valor inicial opcional
  minValue?: number; // Valor mínimo opcional
  maxValue?: number; // Valor máximo opcional
  step?: number; // Passo de incremento opcional
  onValueChange?: (value: number) => void; // Callback opcional quando o valor muda
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'style' | 'textAlign'>; // Permite passar outras props para o TextInput
}

// --- Helper de Formatação ---
/**
 * Formata um número para string de porcentagem no padrão brasileiro.
 * Ex: 10.5 => "10,50%"
 * Ex: 0.1 => "0,10%"
 * Ex: 5 => "5,00%"
 */
const formatPercentage = (value: number | undefined | null, minValue: number): string => {
  // Se indefinido, nulo ou NaN, usa o valor mínimo como fallback seguro
  const num = (value === undefined || value === null || isNaN(value)) ? minValue : value;
  // Arredonda para 2 casas decimais, converte para string e troca ponto por vírgula
  const formatted = num.toFixed(2).replace('.', ',');
  return `${formatted}%`;
};

// --- Componente Funcional Tipado (FC) ---
const PercentageSelector: FC<PercentageSelectorProps> = ({
  label = "Percentual do saldo:",
  initialValue = 50,
  minValue = 0,
  maxValue = 100,
  step = 0.01, // <<-- Ajustado para permitir decimais por padrão
  onValueChange = () => {},
  textInputProps = {},
}) => {
  useFonts({
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf')
  });
  // --- Estados ---
  const clampValue = (val: number) => Math.min(maxValue, Math.max(minValue, val));
  const roundToStep = (val: number) => Math.round(val / step) * step; // Arredonda para o step mais próximo

  const [percentage, setPercentage] = useState<number>(() =>
      clampValue(roundToStep(initialValue)) // Garante valor inicial válido e no step
  );
  const [inputValue, setInputValue] = useState<string>(() =>
      formatPercentage(percentage, minValue) // Formata valor inicial
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // --- Efeito para Sincronizar com initialValue ---
  useEffect(() => {
      const clampedInitial = clampValue(initialValue);
      const steppedInitial = roundToStep(clampedInitial); // Garante que está alinhado com o step
      // Atualiza apenas se o valor prop processado for diferente do estado atual
      if (steppedInitial !== percentage) {
          setPercentage(steppedInitial);
          if (!isFocused) {
              setInputValue(formatPercentage(steppedInitial, minValue));
          }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, minValue, maxValue, step]); // Adicionado step, removido percentage/isFocused

  // --- Efeito para Sincronizar inputValue quando percentage muda (ex: pelo slider) ---
  useEffect(() => {
      if (!isFocused) {
          const formattedValue = formatPercentage(percentage, minValue);
          if (inputValue !== formattedValue) {
               setInputValue(formattedValue);
          }
      }
       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, isFocused]); // Removido inputValue

  // --- Handler para Mudanças no Slider ---
  const handleSliderChange = useCallback((value: number): void => {
      // Slider já retorna valor baseado no step, mas arredondamos para garantir precisão float
      const roundedValue = parseFloat(value.toFixed(String(step).includes('.') ? String(step).split('.')[1].length : 0)); // Arredonda para casas decimais do step
      const clampedValue = clampValue(roundedValue);

      if (clampedValue !== percentage) {
          setPercentage(clampedValue);
          // Atualiza input imediatamente, mesmo se focado, pois veio do slider
          setInputValue(formatPercentage(clampedValue, minValue));
          onValueChange(clampedValue);
      }
  }, [percentage, step, minValue, maxValue, onValueChange, clampValue]);

  // --- Handler para Mudanças no TextInput ---
  const handleTextInputChange = useCallback((text: string): void => {
      setInputValue(text); // Atualiza o texto exibido imediatamente

      // Prepara para parse: remove '%', troca vírgula por ponto
      const cleanedText = text.replace('%', '').replace(',', '.');

      // Tenta converter para número
      let numericValue = parseFloat(cleanedText);

      // Caso especial: se o usuário digitar apenas "." ou "," (interpretado como ".")
      // permite temporariamente, mas não atualiza 'percentage' ainda.
       if (cleanedText === '.' && text.length === 1) {
           return; // Não faz nada com 'percentage' ainda
       }

      if (text === '' || text === '%') {
           // Se apagou tudo, reseta para o mínimo
          if (percentage !== minValue) {
              setPercentage(minValue);
              onValueChange(minValue);
          }
      } else if (!isNaN(numericValue)) {
          // Se conseguiu um número, valida e atualiza o estado 'percentage'
          const clampedValue = clampValue(numericValue);
          // Não arredondamos pelo step aqui para permitir digitação livre,
          // o arredondamento final acontece no blur ou slider.
          if (clampedValue !== percentage) {
              setPercentage(clampedValue);
              onValueChange(clampedValue);
          }
      }
      // Se for inválido (ex: "abc", "1.2.3"), não atualiza 'percentage',
      // mas 'inputValue' já mostra o texto inválido.
  }, [percentage, minValue, maxValue, onValueChange, clampValue]);

  // --- Handler para Foco ---
  const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Opcional: Remover o '%' e talvez formatar com ponto ao focar?
      // setInputValue(percentage.toString().replace('.', ',')); // Exemplo com vírgula mas sem %
  }, []);

  // --- Handler para Perda de Foco ---
  const handleBlur = useCallback(() => {
      setIsFocused(false);

      // Usa o estado 'percentage' como fonte da verdade,
      // pois ele foi atualizado no onChangeText com o valor numérico válido.
      // Re-clamp e arredonda para o step para garantir consistência final.
      const finalValue = roundToStep(clampValue(percentage));

      // Atualiza o estado 'percentage' caso o arredondamento/clamp mude o valor
      if (finalValue !== percentage) {
          setPercentage(finalValue);
          onValueChange(finalValue);
      }

      // Formata o valor final para exibição
      setInputValue(formatPercentage(finalValue, minValue));

      // Keyboard.dismiss();
  }, [percentage, minValue, maxValue, step, onValueChange, clampValue, roundToStep]);

  return (
      <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>

          <TextInput
              style={styles.textInput}
              value={inputValue} // Ligado ao estado do texto do input
              onChangeText={handleTextInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur} // Valida e formata ao perder o foco
              keyboardType="decimal-pad" // Melhor teclado para números com decimais
              // maxLength={...} // MaxLength pode ser complicado com decimais e '%', talvez remover?
              textAlign="center"
              selectTextOnFocus
              {...textInputProps}
          />

          <View style={styles.sliderContainer}>
              {/* Exibe limites formatados */}
              <Text style={styles.limitText}>{formatPercentage(minValue, minValue).replace('%','')}</Text>
              <Slider
                  style={styles.slider}
                  minimumValue={minValue}
                  maximumValue={maxValue}
                  step={step} // Permite steps decimais
                  value={percentage} // Controlado pelo estado 'percentage'
                  onValueChange={handleSliderChange} // Atualiza ambos os estados
                  minimumTrackTintColor={PRIMARY_COLOR}
                  maximumTrackTintColor={SECONDARY_COLOR}
                  thumbTintColor={PRIMARY_COLOR}
              />
              <Text style={styles.limitText}>{formatPercentage(maxValue, minValue).replace('%','')}</Text>
          </View>
      </View>
  );
};

// --- Estilos (permanecem os mesmos) ---
const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
    fontFamily: 'OpenSans-Regular'
  },
  textInput: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    backgroundColor: '#fff',
    fontFamily: 'OpenSans-Bold'
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  limitText: {
    fontSize: 16,
    color: '#666',
    minWidth: 45, // Aumentei um pouco para garantir espaço para "100"
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular'
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
});

export default PercentageSelector;