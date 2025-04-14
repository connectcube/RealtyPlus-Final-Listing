export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUa5THDHljv145TrZlCKsJc95svqfEXi7e5cy7fhB9vgSKSHfDk-vmbBqh1JeV3YSG/exec';

export const submitContactForm = async (formData: ContactFormData): Promise<Response> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return response;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};
