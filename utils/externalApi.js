import fetch from 'node-fetch';

export const fetchMovieData = async (title, year) => {
  const apiKey = 'bac26790'; // Replace with your actual API key
  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${title}&y=${year}`;
    
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch movie data');
    }
    const movieData = await response.json();
    return movieData;
  } catch (error) {
    throw new Error('Error fetching movie data from the external API');
  }
};