export const formatFirebaseTimestamp = (timestamp: any) => {
  try {
    // Check if it's a Firebase timestamp
    if (timestamp && timestamp.seconds) {
      // Convert Firebase timestamp to JavaScript Date
      const date = new Date(timestamp.seconds * 1000);
      
      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return 'No date available';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};