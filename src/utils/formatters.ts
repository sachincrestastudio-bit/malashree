export const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
export const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`;
export const formatTime = (date: Date) => date.toLocaleTimeString();
export const formatDate = (date: Date) => date.toLocaleDateString();
