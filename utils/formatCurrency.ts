// utils/formatCurrency.ts (or inside your component file)
export const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'R$ 0,00';
    }
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };