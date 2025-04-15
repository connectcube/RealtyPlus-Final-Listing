export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

const API_BASE_URL =  'http://localhost:3000';

export const submitContactForm = async (formData: ContactFormData): Promise<Response> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to submit form');
    }

    return response;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};
