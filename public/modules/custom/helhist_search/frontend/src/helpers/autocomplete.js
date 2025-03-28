import { API_URL } from '../constants/constants.js';

const fetchAutocompleteSuggestions = async (searchQuery) => {
  try {
    const params = new URLSearchParams({
      q: searchQuery.trim()
    });

    const res = await fetch(`${API_URL}/search_api_autocomplete/search?${params}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Autocomplete fetch error:', err);
    throw err;
  }
}

export { fetchAutocompleteSuggestions }
