import { API_URL } from '../config';

/**
 * Enhanced fetch wrapper with retry logic, logging, and error handling.
 */
export const apiFetch = async (endpoint, options = {}, retries = 2) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const method = options.method || 'GET';

  console.log(`[API Request] ${method} ${url}`, options.body ? JSON.parse(options.body) : '');

  try {
    const response = await fetch(url, options);
    
    // Log response status
    console.log(`[API Response] ${method} ${url} - Status: ${response.status}`);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      // If it's a 404, we might want to retry if the server was restarting
      if (response.status === 404 && retries > 0) {
        console.warn(`[API Retry] 404 encountered, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return apiFetch(endpoint, options, retries - 1);
      }

      if (isJson) {
        const errorData = await response.json();
        const errorMsg = errorData.error || `Server Error (${response.status})`;
        
        // Handle session expiration/invalid tokens
        if (errorMsg === 'Invalid token' || response.status === 401) {
          localStorage.clear();
          window.location.href = '/';
        }
        
        throw new Error(errorMsg);
      } else {
        const text = await response.text();
        throw new Error(`Unexpected Response (${response.status}): ${text.substring(0, 100)}`);
      }
    }

    return isJson ? await response.json() : await response.text();

  } catch (error) {
    if (retries > 0 && error.message.includes('Failed to fetch')) {
      console.warn(`[API Retry] Network error, retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 1500));
      return apiFetch(endpoint, options, retries - 1);
    }
    console.error(`[API Error] ${method} ${url}:`, error.message);
    throw error;
  }
};
