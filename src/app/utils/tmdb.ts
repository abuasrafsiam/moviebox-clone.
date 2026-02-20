const API_KEY = 'fc113ae7bdb111be9218caccbfb49bfe';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const tmdb = {
  getPopularMoviesWithTrailers: async (page = 1) => {
    try {
      // Fetch popular movies
      const moviesResponse = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&per_page=50`);
      const moviesData = await moviesResponse.json();
      
      if (!moviesData.results) {
        console.error('❌ No results from popular movies', moviesData);
        return { results: [], total_pages: 0 };
      }

      // Fetch trailers for each movie (batch requests)
      const moviesWithTrailers = await Promise.all(
        moviesData.results.map(async (movie: any) => {
          try {
            const videosResponse = await fetch(
              `${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`
            );
            const videosData = await videosResponse.json();

            // Find YouTube trailer
            const trailer = videosData.results?.find(
              (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
            );

            return {
              ...movie,
              trailerKey: trailer?.key || null,
              youtubeId: trailer?.key || null,
            };
          } catch (error) {
            console.error(`Error fetching videos for movie ${movie.id}:`, error);
            return { ...movie, trailerKey: null, youtubeId: null };
          }
        })
      );

      console.log(`✅ Fetched ${moviesWithTrailers.length} movies with trailers`);
      return {
        results: moviesWithTrailers,
        total_pages: moviesData.total_pages,
        page: moviesData.page,
      };
    } catch (error) {
      console.error('❌ Error fetching popular movies:', error);
      return { results: [], total_pages: 0 };
    }
  },

  getMovieTrailerKey: async (movieId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
      const data = await response.json();
      
      const trailer = data.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      return trailer?.key || null;
    } catch (error) {
      console.error(`Error fetching trailer for movie ${movieId}:`, error);
      return null;
    }
  },

  getTrending: async (type = 'movie', timeWindow = 'day') => {
    const response = await fetch(`${BASE_URL}/trending/${type}/${timeWindow}?api_key=${API_KEY}`);
    return response.json();
  },
  getMoviesByCategory: async (categoryId: string) => {
    // Mapping categories to TMDB genres or sections
    // Genre IDs: Action=28, Comedy=35, Drama=18, Thriller=53
    let endpoint = `/movie/popular`;
    
    if (categoryId === 'bollywood') {
      endpoint = `/discover/movie?with_original_language=hi`;
    } else if (categoryId === 'hollywood') {
      endpoint = `/discover/movie?with_original_language=en`;
    } else if (categoryId === 'action') {
      endpoint = `/discover/movie?with_genres=28`;
    } else if (categoryId === 'comedy') {
      endpoint = `/discover/movie?with_genres=35`;
    } else if (categoryId === 'drama') {
      endpoint = `/discover/movie?with_genres=18`;
    } else if (categoryId === 'thriller') {
      endpoint = `/discover/movie?with_genres=53`;
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
    return response.json();
  },
  // ── Extract YouTube trailer from videos array ────────────────────────────
  extractYouTubeTrailerId: (videosArray: any[] = []) => {
    if (!videosArray || videosArray.length === 0) return null;
    
    // First priority: Official Trailer
    let trailer = videosArray.find(
      (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    // Fallback: Any YouTube video
    if (!trailer) {
      trailer = videosArray.find((video: any) => video.site === 'YouTube');
    }
    
    return trailer?.key || null;
  },

  // ── Fallback search by title + "official trailer" ────────────────────────
  searchTrailerByTitle: async (title: string, mediaType: 'movie' | 'tv') => {
    try {
      const searchQuery = `${title} official trailer`;
      const response = await fetch(
        `${BASE_URL}/search/${mediaType}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&per_page=5`
      );
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.warn(`⚠️ No trailer search results for "${title}"`);
        return null;
      }
      
      // Get first result and fetch its videos
      const firstResult = data.results[0];
      const detailsEndpoint = mediaType === 'tv' ? 'tv' : 'movie';
      const videosResponse = await fetch(
        `${BASE_URL}/${detailsEndpoint}/${firstResult.id}/videos?api_key=${API_KEY}`
      );
      const videosData = await videosResponse.json();
      
      return tmdb.extractYouTubeTrailerId(videosData.results);
    } catch (error) {
      console.error(`Error searching trailer for "${title}":`, error);
      return null;
    }
  },

  // ── Get YouTube ID from movie/TV details with fallback ────────────────────
  getTrailerId: async (id: string, title: string, mediaType: 'movie' | 'tv') => {
    try {
      // First, get details with videos included
      const detailsUrl = mediaType === 'tv' 
        ? `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos`
        : `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      // Try to extract YouTube ID from videos array
      let youtubeId = tmdb.extractYouTubeTrailerId(data.videos?.results);
      
      // If no videos, fallback to search by title
      if (!youtubeId && title) {
        console.log(`📽️ No trailer in videos array for ${title}, searching by title...`);
        youtubeId = await tmdb.searchTrailerByTitle(title, mediaType);
      }
      
      if (youtubeId) {
        console.log(`✅ Found trailer for ${title}: ${youtubeId}`);
      } else {
        console.warn(`❌ No trailer found for ${title}`);
      }
      
      return youtubeId;
    } catch (error) {
      console.error(`Error fetching trailer ID for ${id}:`, error);
      return null;
    }
  },

  getMovieDetails: async (id: string) => {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,similar,credits`);
    return response.json();
  },
  getTVDetails: async (id: string) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos,similar,credits`);
    return response.json();
  },
  search: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    return response.json();
  },
  getImageUrl: (path: string | null) => (path ? `${IMAGE_BASE_URL}${path}` : 'https://via.placeholder.com/500x750?text=No+Image'),

  // ── UNIFIED: Resolve YouTube ID (local data first, then TMDB API) ──────────
  resolveYouTubeId: async (movieId: string | number, title: string = '', mediaType: 'movie' | 'tv' = 'movie') => {
    // Import locally to avoid circular deps
    const { movieStreams } = await import('../data/movie-data');
    
    // Step 1: Check local curated library first
    const localEntry = movieStreams[String(movieId)];
    if (localEntry?.youtubeId) {
      console.log(`✅ Using local YouTube ID for ${title || movieId}: ${localEntry.youtubeId}`);
      return localEntry.youtubeId;
    }
    
    // Step 2: Fetch from TMDB API (with fallback search)
    console.log(`🔍 Resolving YouTube ID from TMDB for "${title || movieId}"...`);
    const youtubeId = await tmdb.getTrailerId(String(movieId), title, mediaType);
    
    return youtubeId;
  },
};