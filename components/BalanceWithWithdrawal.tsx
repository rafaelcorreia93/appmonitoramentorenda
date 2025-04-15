import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  SafeAreaView, // Use SafeAreaView inside the modal for better spacing
  Alert, // For simple feedback or error handling if needed
  Keyboard, // To dismiss keyboard
  TouchableWithoutFeedback, // To dismiss keyboard on tap outside inputs
  StyleProp,
  ViewStyle
} from 'react-native';
import Slider from '@react-native-community/slider';
import { formatCurrency } from '@/utils/formatCurrency';

// --- Props Type ---

type BalanceWithWithdrawalProps = {
  /** The total initial balance for the simulation */
  initialBalance: number;
  /** Optional style for the main container card */
  containerStyle?: StyleProp<ViewStyle>;
  /** Maximum withdrawal percentage allowed (e.g., 25 based on prototype) */
  maxWithdrawalPercentage?: number;
  /** Callback when the withdrawal percentage is confirmed */
  onWithdrawalChange?: (percentage: number | null) => void;
};

// --- Component ---

const BalanceWithWithdrawal: React.FC<BalanceWithWithdrawalProps> = ({
  initialBalance,
  containerStyle,
  maxWithdrawalPercentage = 25, // Default max percentage from prototype
  onWithdrawalChange,
}) => {
  const [withdrawalPercentage, setWithdrawalPercentage] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Temporary state for modal inputs
  const [tempPercentage, setTempPercentage] = useState<number>(0);

  // Calculate derived values
  const withdrawnAmount = useMemo(() => {
    if (withdrawalPercentage === null || withdrawalPercentage <= 0) return 0;
    return initialBalance * (withdrawalPercentage / 100);
  }, [initialBalance, withdrawalPercentage]);

  const currentBalance = useMemo(() => {
    return initialBalance - withdrawnAmount;
  }, [initialBalance, withdrawnAmount]);

  // Update temp percentage when opening modal for editing
  useEffect(() => {
    if (modalVisible) {
      setTempPercentage(withdrawalPercentage ?? 0);
    }
  }, [modalVisible, withdrawalPercentage]);


  // --- Modal Handlers ---

  const handleOpenModal = () => {
    setTempPercentage(withdrawalPercentage ?? 0); // Set initial modal value
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    // No changes, tempPercentage is reset on next open anyway
  };

  const handleConfirm = () => {
    // Optional: Basic validation
    if (tempPercentage < 0 || tempPercentage > maxWithdrawalPercentage) {
       Alert.alert("Valor Inválido", `Por favor, insira um percentual entre 0 e ${maxWithdrawalPercentage}%.`);
       return;
    }

    const newPercentage = tempPercentage > 0 ? tempPercentage : null;
    setWithdrawalPercentage(newPercentage);
    setModalVisible(false);
    if (onWithdrawalChange) {
      onWithdrawalChange(newPercentage);
    }
  };

  // Handlers to synchronize Slider and TextInput
  const handleSliderChange = (value: number) => {
    setTempPercentage(Math.round(value)); // Round to nearest integer
  };

  const handleInputChange = (text: string) => {
     // Allow empty input or numbers, clamp to range
     const numericValue = parseInt(text, 10);
     if (text === '') {
         setTempPercentage(0);
     } else if (!isNaN(numericValue)) {
        setTempPercentage(Math.max(0, Math.min(maxWithdrawalPercentage, numericValue)));
     }
  };

  // --- Render ---

  return (
    <View style={[styles.card, containerStyle]}>
      {/* Content changes based on whether withdrawal exists */}
      {withdrawalPercentage === null || withdrawalPercentage === 0 ? (
        // --- State: No Withdrawal ---
        <>
          <Text style={styles.label}>Saldo atual para simulação</Text>
          <Text style={styles.balanceText}>{formatCurrency(initialBalance)}</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleOpenModal}
          >
            <Text style={styles.primaryButtonText}>Adicionar Resgate Parcial</Text>
          </TouchableOpacity>
        </>
      ) : (
        // --- State: With Withdrawal ---
        <>
          <Text style={styles.label}>Saldo atual para simulação</Text>
          <Text style={styles.balanceText}>{formatCurrency(currentBalance)}</Text>

          <View style={styles.withdrawalInfoBox}>
            <Text style={styles.withdrawalLabel}>Resgate parcial:</Text>
            <Text style={styles.withdrawalValue}>
              {formatCurrency(withdrawnAmount)} ({withdrawalPercentage}%)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleOpenModal}
          >
            <Text style={styles.primaryButtonText}>Alterar Resgate Parcial</Text>
          </TouchableOpacity>
        </>
      )}

      {/* --- Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel} // For Android back button
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Saldo atual para simulação</Text>
              <Text style={styles.modalBalance}>{formatCurrency(initialBalance)}</Text>

              <Text style={styles.modalInstruction}>
                Selecione abaixo um valor percentual para utilizar como resgate parcial do seu saldo:
              </Text>

              <Text style={styles.modalInputLabel}>Percentual do saldo para resgate</Text>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="number-pad"
                value={tempPercentage.toString()} // Keep as string for input
                onChangeText={handleInputChange}
                maxLength={3} // Max 100% technically, adjust if max is lower
                selectTextOnFocus
              />

              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={maxWithdrawalPercentage}
                step={1} // Integer percentages
                value={tempPercentage}
                onValueChange={handleSliderChange} // Use onValue for continuous updates while sliding
                minimumTrackTintColor="#3C2E88"
                maximumTrackTintColor="#E0E0E0" // Light Gray
                thumbTintColor="#3C2E88"
              />
               <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>0</Text>
                  <Text style={styles.sliderLabelText}>{maxWithdrawalPercentage}</Text>
              </View>

              <Text style={styles.modalCalculatedValue}>
                Valor a ser descontado: {formatCurrency(initialBalance * (tempPercentage / 100))}
              </Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
         </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// --- Styles ---

const PRIMARY_COLOR = '#3C2E88'; // Indigo/Dark Purple (adjust as needed)
const SECONDARY_COLOR = '#E71414'; // Crimson Red for cancel

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
    fontFamily: 'OpenSans-Regular',
  },
  balanceText: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#333333',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5, // Matching prototype button border
  },
  primaryButton: {
    backgroundColor: '#FFFFFF', // White background
    borderColor: PRIMARY_COLOR, // Purple border
  },
  primaryButtonText: {
    color: PRIMARY_COLOR, // Purple text
    fontSize: 16,
    fontFamily: 'OpenSans-Bold'
  },
  // Styles for the "With Withdrawal" state
  withdrawalInfoBox: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR, // Purple border
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center', // Center text inside
  },
  withdrawalLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
    fontFamily: 'OpenSans-Regular'
  },
  withdrawalValue: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
    color: '#333333',
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 25, // More padding for modal
    width: '90%', // Adjust width as needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
    fontFamily: 'OpenSans-Regular'
    // textAlign: 'center',
  },
  modalBalance: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: '#333333',
    marginBottom: 15,
    // textAlign: 'center',
  },
  modalInstruction: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: '#555555',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'left', // Match prototype
  },
  modalInputLabel:{
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'OpenSans-Regular'
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC', // Lighter border for input
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15, // Space before slider
    color: '#333333',
    fontFamily: 'OpenSans-Regular'
  },
  slider: {
    width: '100%',
    height: 40, // Standard slider height
    marginBottom: 0, // Reduce margin if labels are close
  },
  sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20, // Space before calculated value
      paddingHorizontal: 5, // Align roughly with slider ends
  },
  sliderLabelText: {
      fontSize: 12,
      color: '#666666',
    fontFamily: 'OpenSans-Regular'
  },
  modalCalculatedValue: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
    color: '#333333',
    textAlign: 'center', // Center the calculated value
    marginBottom: 25, // Space before buttons
  },
  modalButtonContainer: {
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 14, // Slightly larger modal buttons
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // Space between buttons
  },
  confirmButton: {
    backgroundColor: PRIMARY_COLOR, // Purple background
    borderColor: PRIMARY_COLOR,
    borderWidth: 1.5,
  },
  confirmButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontFamily: 'OpenSans-Bold'
  },
  cancelButton: {
    backgroundColor: '#FFFFFF', // White background
    borderColor: SECONDARY_COLOR, // Red border
    borderWidth: 1.5,
  },
  cancelButtonText: {
    color: SECONDARY_COLOR, // Red text
    fontSize: 16,
    fontFamily: 'OpenSans-Bold'
  },
});

export default BalanceWithWithdrawal;