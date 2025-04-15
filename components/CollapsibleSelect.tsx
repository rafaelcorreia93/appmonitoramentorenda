import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Types ---

export type SelectOption = {
  id: string | number;
  iconName: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string; // Still needed for the expanded view
};

type CollapsibleSelectProps = {
  /** Label shown when the component is closed AND no item is selected */
  label: string;
  /** Label shown in the header when an item IS selected (e.g., "Alterar...") */
  editLabel?: string;
  options: SelectOption[];
  selectedValue: string | number | null | undefined;
  onValueChange: (value: string | number) => void;
  introText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  selectedItemStyle?: StyleProp<ViewStyle>;
  unselectedItemStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  optionIconColor?: string;
  editIconColor?: string; // Optional: specific color for edit icon
};

// --- Component ---

const CollapsibleSelect: React.FC<CollapsibleSelectProps> = ({
  label,
  editLabel = "Alterar o tipo de renda", // Default edit label
  options,
  selectedValue,
  onValueChange,
  introText = "Escolha uma das formas de recebimento de renda para começar a simulação",
  containerStyle,
  labelStyle,
  selectedItemStyle,
  unselectedItemStyle,
  iconColor = '#3C2E88', // Default purple color
  optionIconColor = '#E33E5A', // Default red color for option icons
  editIconColor, // Defaults to iconColor if not provided
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the full selected option object efficiently
  const selectedOption = useMemo(() => {
    return options.find(opt => opt.id === selectedValue);
  }, [options, selectedValue]);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionId: string | number) => {
    onValueChange(optionId);
    // Always close after selection to show the summary view
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(false);
  };

  // Determine header text and icon based on state
  const isItemSelected = !!selectedOption;
  const displayLabel = !isOpen && isItemSelected ? editLabel : label;
  const displayIconName: React.ComponentProps<typeof Feather>['name'] =
    isOpen ? 'chevron-up'
    : isItemSelected ? 'edit' // Edit icon when closed and selected
    : 'chevron-down'; // Default down chevron

  const finalEditIconColor = editIconColor || iconColor; // Use specific edit color or fallback

  // --- Render ---

  return (
    <View style={[styles.mainContainer, containerStyle]}>
      {/* Header (Always Visible, appearance changes) */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.label, labelStyle, isItemSelected && !isOpen && styles.editLabelStyle]}>
          {displayLabel}
        </Text>
        <Feather name={displayIconName}
          size={28}
          color={isItemSelected && !isOpen ? finalEditIconColor : iconColor}/>
      </TouchableOpacity>

      {/* Selected Item Preview (Shown only when closed and item is selected) */}
      {!isOpen && selectedOption && (
        <View style={styles.selectedItemPreviewContainer}>
           {/* This View mimics the selected card style but is not interactive */}
          <View style={[
            styles.optionCardBase, // Use base card style
            styles.optionCardSelected, // Use selected style
            selectedItemStyle, // Apply overrides
            styles.selectedItemPreviewCard // Add specific preview styles
          ]}>
              <Feather
                name={selectedOption.iconName}
                size={20}
                color={optionIconColor} // Use the same icon color as options
                style={styles.optionIcon}
              />
              {/* Only show title in the preview */}
              <Text style={[styles.optionTitle, styles.optionTitleSelected, styles.optionPreview]}>
                {selectedOption.title}
              </Text>
          </View>
        </View>
      )}

      {/* Options List (Shown only when open) */}
      {isOpen && (
        <View style={styles.optionsContent}>
          {introText && <Text style={styles.introText}>{introText}</Text>}
          {options.map((option) => {
            const isSelected = option.id === selectedValue;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCardBase,
                  isSelected
                    ? styles.optionCardSelected
                    : styles.optionCardUnselected,
                  isSelected ? selectedItemStyle : unselectedItemStyle,
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.8}
              >
                <Feather
                  name={option.iconName}
                  size={24}
                  color={optionIconColor}
                  style={styles.optionIcon}
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.title}
                  </Text>
                  {/* Description is only shown in the expanded list */}
                  <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom:0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Keep this
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    // Add a bottom border only if an item is selected and closed, to separate from preview
    // borderBottomWidth: selectedValue && !isOpen ? 1 : 0, // Adjusted this logic, separator is handled by preview container
    // borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 17,
    fontFamily: 'OpenSans-Bold',
    color: '#3C2E88', // Default label color (purple)
    flexShrink: 1,
    marginRight: 8,
  },
   // Optional: slightly different style for the edit label if needed
  editLabelStyle: {
     // color: '#AnotherColor', // Example if you want a different color
  },
  // Container for the selected item preview when closed
  selectedItemPreviewContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16, // Add padding below the preview item
    borderTopWidth: 1, // Separator line above preview
    borderTopColor: '#EEEEEE',
  },
  // Specific style adjustments for the preview card
  selectedItemPreviewCard: {
     marginTop: 16, // Space between separator and preview card
     marginBottom: 0, // Remove bottom margin inherited from optionCardBase if needed
     // Make sure it's not interactive if it inherits touchable styles
     // pointerEvents: 'none', // This is more for web, not standard RN. The wrapping View prevents interaction.
  },
  optionsContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  introText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'OpenSans-Regular',
  },
  optionCardBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  optionCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    backgroundColor: '#FCE5EA',
    borderColor: '#E33E5A',
  },
  optionIcon: {
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
    color: '#333333',
    marginBottom: 5,
  },
  optionTitleSelected: {
     color: '#333333',
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'OpenSans-Regular',
    color: '#666666',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: '#666666',
  },
  optionPreview: {
    fontSize: 14
  }
});

export default CollapsibleSelect;