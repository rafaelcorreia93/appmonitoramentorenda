import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { TextInputMask, TextInputMaskOptionProp, TextInputMaskMethods } from 'react-native-masked-text';

// ... (interface e outras partes do componente permanecem iguais) ...
interface CurrencyInputProps extends TextInputProps {
  label: string;
  initialValue?: number; // Valor inicial em CENTAVOS (ex: 10000 para R$ 100,00)
  onChangeValue: (value: number | undefined) => void; // Callback com valor numérico em CENTAVOS
  maskOptions?: TextInputMaskOptionProp;
  // A prop 'style' é herdada de TextInputProps, mas se quiser tipar explicitamente
  // para o container ou algo assim, faria aqui. Geralmente, passar via ...rest
  // para o TextInputMask é suficiente para o estilo do input em si.
}
const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  initialValue,
  onChangeValue,
  maskOptions,
  style,
  ...rest
}) => {
  const inputRef = useRef<TextInputMask & TextInputMaskMethods>(null);

  const defaultMaskOptions: TextInputMaskOptionProp = useMemo(() => ({
    precision: 2,
    separator: ',',
    delimiter: '.',
    unit: 'R$ ',
    suffixUnit: '',
  }), []);

  const mergedOptions = useMemo(() => ({
    ...defaultMaskOptions,
    ...(maskOptions ?? {})
  }), [defaultMaskOptions, maskOptions]);

  // Função auxiliar para converter string formatada (BRL) para centavos
  const getCentsFromMaskedText = useCallback((text: string | null | undefined): number | undefined => {
    if (!text) {
        return undefined;
    }

    const { unit = 'R$ ', delimiter = '.', separator = ',', precision = 2 } = mergedOptions;

    // 1. Remover unidade monetária e espaços
    let numericString = text.replace(unit, '').trim();

    // 2. Remover delimitadores de milhar
    //    Precisamos escapar o ponto se ele for o delimitador, pois é um caractere especial em regex
    const delimiterRegex = new RegExp(`\\${delimiter}`, 'g');
    numericString = numericString.replace(delimiterRegex, '');

    // 3. Substituir separador decimal por ponto (padrão para parseFloat)
    numericString = numericString.replace(separator, '.');

    // 4. Converter para número (float)
    const floatValue = parseFloat(numericString);

    // 5. Validar e converter para centavos
    if (!isNaN(floatValue)) {
        // Arredondar para evitar problemas de precisão de float e multiplicar por 100
        const cents = Math.round(floatValue * 100);
        return cents;
    }

    // Retorna undefined se não conseguir parsear
    return undefined;

  }, [mergedOptions]);


  const formatValueFromCents = useCallback((valueInCents: number | undefined): string => {
    // ...(função formatValueFromCents como antes)...
    if (valueInCents === undefined || valueInCents === null || isNaN(valueInCents)) {
        return '';
    }
    const { precision = 2, separator = ',', delimiter = '.', unit = 'R$ ' } = mergedOptions;
    const cents = Math.round(valueInCents);
    const valueInReais = cents / 100;
    let numberAsString = valueInReais.toFixed(precision);
    let [integerPart, decimalPart = ''] = numberAsString.split('.');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
    decimalPart = decimalPart.padEnd(precision, '0');

    if (precision === 0) {
        return `${unit}${integerPart}`;
    }
    return `${unit}${integerPart}${separator}${decimalPart}`;
  }, [mergedOptions]);


  const [formattedValue, setFormattedValue] = useState<string>(() =>
    formatValueFromCents(initialValue)
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // console.log('[EFFECT] Prop initialValue mudou para (cents):', initialValue);
    const newFormattedValue = formatValueFromCents(initialValue);
    // console.log('[EFFECT] Novo valor formatado:', newFormattedValue);
    setFormattedValue(newFormattedValue);
  }, [initialValue, formatValueFromCents]);

  // --- Handler de Mudança REESCRITO ---
  // Agora calcula o valor a partir do maskedText
  const handleTextChange = (maskedText: string) => { // Não precisamos mais do rawText aqui
    console.log('--- handleTextChange ---');
    console.log('Recebido maskedText:', maskedText);

    // 1. Atualiza o estado que controla o input VISUALMENTE
    //    É importante fazer isso para que o usuário veja a máscara funcionando
    setFormattedValue(maskedText);

    // 2. Calcula o valor numérico (em centavos) a partir do maskedText atualizado
    const numericValue = getCentsFromMaskedText(maskedText);

    console.log('Valor numérico final (cents) extraído do maskedText:', numericValue);

    // 3. Chama o callback do pai com o valor em centavos calculado
    onChangeValue(numericValue);
  };


  const placeholderText = useMemo(() => {
      const { precision = 2, separator = ',', unit = 'R$ '} = mergedOptions;
      const zeroDecimal = '0'.repeat(precision);
      if (precision === 0) {
          return `${unit}0`;
      }
      return `${unit}0${separator}${zeroDecimal}`;
  }, [mergedOptions]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInputMask
        ref={inputRef}
        type={'money'}
        options={mergedOptions}
        value={formattedValue}
        // includeRawValueInChangeText={true} // NÃO PRECISAMOS MAIS DESTA PROP
        onChangeText={handleTextChange} // Handler agora só usa maskedText
        keyboardType="numeric"
        placeholder={placeholderText}
        style={[styles.input, style]}
        maxLength={18}
        {...rest}
      />
    </View>
  );
};
// Estilos do componente
const styles = StyleSheet.create({
  container: {
    width: '100%', // Ocupa a largura disponível
    marginBottom: 16, // Espaçamento inferior
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
    fontFamily: 'OpenSans-Regular'
  },
});

export default CurrencyInput;