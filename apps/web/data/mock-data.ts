export const mockCategories = [
  { label: "Biryani", iconKey: "sushi" as const },
  { label: "Rolls", iconKey: "burger" as const },
  { label: "Kebabs", iconKey: "forkKnife" as const },
  { label: "Mithai", iconKey: "cake" as const },
  { label: "Desserts", iconKey: "dessert" as const },
  { label: "Veg", iconKey: "leaf" as const },
  { label: "Dosas", iconKey: "forkKnife" as const },
  { label: "Bowls", iconKey: "burger" as const },
  { label: "Bengali", iconKey: "sushi" as const },
  { label: "Chaat", iconKey: "dessert" as const },
];

export function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
