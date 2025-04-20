import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import IntegerInput from '@/components/IntegerInput'; // Assuming this is the correct path
import { useRouter } from 'expo-router'; // For navigation

// Placeholder function to simulate fetching data from storage
const fetchDataNascimentoFromStorage = async (): Promise<Date | null> => {
  // In a real app, fetch this from AsyncStorage, SecureStore, or context
  console.log('Fetching date of birth from storage...');
  // Simulate fetching a date - replace with actual logic
  await new Promise(resolve => setTimeout(resolve, 500));
  // Example: return new Date(1985, 5, 15); // June 15, 1985
  // For now, return null to indicate it needs to be implemented
   // Example: return new Date(1985, 5, 15); // June 15, 1985 (Month is 0-indexed)
   // Return a default date for demonstration if needed, or handle the null case
   return new Date(1980, 0, 1); // January 1, 1980 as an example
};

// Helper function to calculate age
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format date as MM/YYYY
const formatMonthYear = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${month}/${year}`;
};


export default function SimuladorInteligenteScreen() {
  const [prazo, setPrazo] = useState<number>(10); // Default prazo in years
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [idadeFinal, setIdadeFinal] = useState<number | null>(null);
  const [dataFimPrazo, setDataFimPrazo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter(); // Initialize router for navigation

  const MIN_PRAZO = 1;
  const MAX_PRAZO = 50; // Example max limit

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const dob = await fetchDataNascimentoFromStorage();
      if (dob) {
        setDataNascimento(dob);
      } else {
        // Handle case where date of birth is not found (e.g., show an error or prompt)
        Alert.alert("Erro", "Não foi possível carregar a data de nascimento.");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Recalculate derived values when prazo or dataNascimento changes
  useEffect(() => {
    if (dataNascimento) {
      // Calculate final age
      const currentAge = calculateAge(dataNascimento);
      setIdadeFinal(currentAge + prazo);

      // Calculate end date
      const today = new Date();
      const endDate = new Date(today.getFullYear() + prazo, today.getMonth(), today.getDate());
      setDataFimPrazo(formatMonthYear(endDate));
    } else {
        setIdadeFinal(null);
        setDataFimPrazo(null);
    }
  }, [prazo, dataNascimento]);

  // Updated to handle number | null
  const handlePrazoChange = (value: number | null) => {
    if (value === null) {
      // If input is cleared, default to minimum prazo
      setPrazo(MIN_PRAZO);
    } else {
      // Ensure value stays within bounds
      const newPrazo = Math.max(MIN_PRAZO, Math.min(value, MAX_PRAZO));
      setPrazo(newPrazo);
    }
  };

  const handleAvancar = () => {
    // Navigate to the next step of the simulation
    // Replace 'nextStepScreen' with the actual route name
    console.log('Navegando para a próxima etapa com prazo:', prazo);
    // Example navigation:
    // router.push('/simuladores/resultadoInteligente'); // Adjust the path as needed
     Alert.alert("Próxima Etapa", `Prazo selecionado: ${prazo} anos.`); // Placeholder action
  };

   if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Carregando...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Simulador Inteligente</Text>
      <Text style={styles.description}>
        Informe por quanto tempo você deseja continuar recebendo sua aposentadoria complementar.
      </Text>

      <View style={styles.inputSection}>
        {/* Label is now passed as a prop, and onChangeValue is connected */}
        <IntegerInput
          label="Prazo desejado (em anos)"
          value={prazo}
          minValue={MIN_PRAZO}
          maxValue={MAX_PRAZO}
          onChangeValue={handlePrazoChange} // Pass the handler function
        />
        <Text style={styles.infoText}>
          Escolha um prazo entre {MIN_PRAZO} e {MAX_PRAZO} anos.
        </Text>
      </View>

      {idadeFinal !== null && (
          <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>Sua idade ao final do prazo:</Text>
              <Text style={styles.resultValue}>{idadeFinal} anos</Text>
          </View>
      )}


       {dataFimPrazo !== null && (
        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>Data estimada para o fim do prazo:</Text>
          <Text style={styles.resultValue}>{dataFimPrazo}</Text>
        </View>
      )}


      <TouchableOpacity style={styles.button} onPress={handleAvancar}>
        <Text style={styles.buttonText}>Avançar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background color
  },
   contentContainer: {
    padding: 20,
    paddingBottom: 50, // Ensure space for the button
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    color: '#555',
  },
  inputSection: {
    marginBottom: 30,
    alignItems: 'center', // Center IntegerInput
  },
  // Removed the separate label style as it's handled by the component now potentially
  // label: {
  //   fontSize: 16,
  //   fontWeight: '600',
  //   marginBottom: 15, // Increase space before input
  //   color: '#444',
  // },
   infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  resultSection: {
    backgroundColor: '#ffffff', // White background for result sections
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row', // Arrange label and value side-by-side
    justifyContent: 'space-between', // Space them out
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005A9C', // Example brand color
  },
  button: {
    backgroundColor: '#007bff', // Standard blue button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded corners
    alignItems: 'center',
    marginTop: 30, // Space before button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
