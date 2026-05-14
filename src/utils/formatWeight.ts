/** Форматирование веса: кг или г */
export function formatWeight(weight: string | number): string {
  if (!weight) return '';

  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (isNaN(numWeight)) return String(weight);

  if (numWeight >= 1) {
    return `${numWeight} кг`;
  } else {
    const grams = numWeight * 1000;
    return `${grams} г`;
  }
}
