import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInputProps } from 'react-native';
import { TextInputMask, TextInputMaskOptionProp, TextInputMaskMethods } from 'react-native-masked-text';

// Estendendo TextInputProps para poder passar outras props padrão do TextInput
interface CurrencyInputProps extends TextInputProps {
  label: string;
  initialValue?: number; // Valor inicial em CENTAVOS (ex: 10000 para R$ 100,00)
  onChangeValue: (value: number | undefined) => void; // Callback com valor numérico em CENTAVOS
  maskOptions?: TextInputMaskOptionProp; // Para customizar a máscara se necessário
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  initialValue,
  onChangeValue,
  maskOptions,
  style, // Permite passar estilos customizados para o input
  ...rest // Restante das props do TextInput (placeholder, autoFocus, etc.)
}) => {
  const inputRef = useRef<TextInputMask>(null);

  // Estado para o valor formatado (string) que será exibido no input

  // Opções padrão da máscara para Real Brasileiro (BRL)
  const defaultMaskOptions: TextInputMaskOptionProp = {
    precision: 2,        // 2 casas decimais
    separator: ',',      // Separador decimal
    delimiter: '.',      // Separador de milhar
    unit: 'R$ ',         // Símbolo da moeda
    suffixUnit: '',      // Nenhum sufixo após o valor
  };

  // Memoize as opções da máscara para estabilizar a dependência do useCallback/useEffect
  const mergedOptions = useMemo(() => ({
    ...defaultMaskOptions,
    // Garante que as opções passadas não sobrescrevam com undefined
    ...(maskOptions ?? {})
  }), [maskOptions]); // Recalcula apenas se maskOptions mudar

  const formatValue = useCallback((valueInCents: number | undefined): string => {
    if (valueInCents === undefined || valueInCents === null) {
      return '';
    }
    const precision = mergedOptions.precision ?? 2;
    const separator = mergedOptions.separator ?? ',';
    const delimiter = mergedOptions.delimiter ?? '.';
    const unit = mergedOptions.unit ?? 'R$ ';

    const valueInReais = valueInCents / 100;
    const fixedValue = valueInReais.toFixed(precision);
    const parts = fixedValue.split('.');
    const integerPart = parts[0];
    const decimalPart = (parts[1] || '').padEnd(precision, '0');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);

    if (precision === 0) {
      return `${unit}${formattedInteger}`;
    }
    return `${unit}${formattedInteger}${separator}${decimalPart}`;
  }, [mergedOptions]);

    // --- Mudança Principal ---
  // Inicializa o estado formattedValue UMA VEZ com o valor inicial formatado
  const [formattedValue, setFormattedValue] = useState<string>(() => formatValue(initialValue));

  // Ref para rastrear se é a primeira renderização
  const isFirstRender = useRef(true);

  // Efeito para sincronizar com MUDANÇAS EXTERNAS em initialValue
  // APÓS a montagem inicial.
  useEffect(() => {
    // Pula a primeira renderização, pois o useState já cuidou disso
    if (isFirstRender.current) {
      isFirstRender.current = false; // Marca que a primeira renderização passou
      return; // Não faz nada na primeira vez
    }

    // Se initialValue mudar DEPOIS da montagem, atualiza o valor formatado
    // Isso permite que o pai resete ou altere o valor programaticamente
    console.log('Prop initialValue mudou para:', initialValue);
    setFormattedValue(formatValue(initialValue));

  }, [initialValue, formatValue]); // Depende de initialValue e da função formatValue estável


  // Handler de mudança: AGORA é o principal responsável por atualizar formattedValue
  const handleTextChange = (maskedText: string) => {
    setFormattedValue(maskedText);

    // Continua igual - Acessa o método através da instância referenciada
    const rawValueString = (inputRef.current as TextInputMaskMethods | null)?.getRawValue();
  
    const numericValue = rawValueString ? parseInt(rawValueString, 10) : undefined;
  
    console.log('Masked Text:', maskedText);
    console.log('Raw Value String (from ref):', rawValueString);
    console.log('Numeric Value (cents):', numericValue);
  
    onChangeValue(numericValue);
  };

  // Calcula o placeholder dinamicamente baseado nas opções atuais
  const placeholderText = useMemo(() => {
      const precision = mergedOptions.precision ?? 2;
      const separator = mergedOptions.separator ?? ',';
      const unit = mergedOptions.unit ?? 'R$ ';
      const zeroDecimal = '0'.repeat(precision);
      if (precision === 0) {
          return `${unit}0`;
      }
      return `${unit}0${separator}${zeroDecimal}`;
  }, [mergedOptions]);


  console.log("Render CurrencyInput, formattedValue:", formattedValue); // Log para depuração

  return (
    <View style={styles.container}>
      {/* Label do campo */}
      <Text style={styles.label}>{label}</Text>

      {/* Componente TextInputMask */}
      <TextInputMask
        ref={inputRef} // Associe a ref aqui
        type={'money'} // Define o tipo da máscara como monetária
        options={mergedOptions} // Passa as opções de formatação
        value={formattedValue} // Controla o valor exibido pelo estado
        onChangeText={handleTextChange} // Handler para quando o texto muda
        keyboardType="numeric" // Mostra o teclado numérico para o usuário
        placeholder={mergedOptions.unit ? `${mergedOptions.unit}0${mergedOptions.separator}00` : 'R$ 0,00'} // Placeholder dinâmico
        style={[styles.input, style]} // Aplica estilos padrão e customizados
        maxLength={18} // Limita um pouco o tamanho para evitar valores absurdos
        {...rest} // Passa outras props como autoFocus, etc.
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