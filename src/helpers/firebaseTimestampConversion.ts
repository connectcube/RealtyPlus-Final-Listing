export const formatFirebaseTimestamp = (timestamp: any) => {
  if (!timestamp) return 'No date available';
  
  try {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};