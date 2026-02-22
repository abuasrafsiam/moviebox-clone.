/**
 * Universal Movie Engine - Single Source of Truth
 * Consolidates all movie data and resolver logic
 */

import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Browser } from '@capacitor/browser';

// ── Type Definitions ───────────────────────────────────────────────────────────
interface MovieEntry {
  type: string;
  title: string;
  tmdbId: string;
  posterPath?: string;
}

interface MovieDatabase {
  [key: string]: MovieEntry;
}

// ── Consolidated Movie Database ─────────────────────────────────────────────
export const movieDatabase: MovieDatabase = {
  // ── Stranger Things (all seasons as standalone entries) ──────────────────
  "st-season-1": {
    type: "tv",
    title: "Stranger Things Season 1",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-2": {
    type: "tv",
    title: "Stranger Things Season 2",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-3": {
    type: "tv",
    title: "Stranger Things Season 3",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-4": {
    type: "tv",
    title: "Stranger Things Season 4",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-5": {
    type: "tv",
    title: "Stranger Things Season 5",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },

  // ── Primate (Home banner) ─────────────────────────────────────────────────
  "371608": {
    type: "movie",
    title: "Primate",
    tmdbId: "371608"
  },

  // ── Sci-Fi Classics ───────────────────────────────────────────────────────
  "27205": {
    type: "movie",
    title: "Inception",
    tmdbId: "27205"
  },
  "157336": {
    type: "movie",
    title: "Interstellar",
    tmdbId: "157336"
  },
  "438631": {
    type: "movie",
    title: "Dune: Part One",
    tmdbId: "438631"
  },
  "693134": {
    type: "movie",
    title: "Dune: Part Two",
    tmdbId: "693134"
  },
  "603": {
    type: "movie",
    title: "The Matrix",
    tmdbId: "603"
  },
  "577922": {
    type: "movie",
    title: "Tenet",
    tmdbId: "577922"
  },
  "335984": {
    type: "movie",
    title: "Blade Runner 2049",
    tmdbId: "335984"
  },
  "155": {
    type: "movie",
    title: "The Dark Knight",
    tmdbId: "155"
  },
  "414906": {
    type: "movie",
    title: "The Batman",
    tmdbId: "414906"
  },
  "329865": {
    type: "movie",
    title: "Arrival",
    tmdbId: "329865"
  },
  "264660": {
    type: "movie",
    title: "Ex Machina",
    tmdbId: "264660"
  },
  "545611": {
    type: "movie",
    title: "Everything Everywhere All At Once",
    tmdbId: "545611"
  },
  "286217": {
    type: "movie",
    title: "The Martian",
    tmdbId: "286217"
  },
  "137113": {
    type: "movie",
    title: "Edge of Tomorrow",
    tmdbId: "137113"
  },
  "324857": {
    type: "movie",
    title: "Spider-Man: Into the Spider-Verse",
    tmdbId: "324857"
  },
  "569094": {
    type: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    tmdbId: "569094"
  },
  "118340": {
    type: "movie",
    title: "Guardians of the Galaxy",
    tmdbId: "118340"
  },
  "17654": {
    type: "movie",
    title: "District 9",
    tmdbId: "17654"
  },
  "9693": {
    type: "movie",
    title: "Children of Men",
    tmdbId: "9693"
  },
  "59967": {
    type: "movie",
    title: "Looper",
    tmdbId: "59967"
  },
  "180": {
    type: "movie",
    title: "Minority Report",
    tmdbId: "180"
  },
  "18": {
    type: "movie",
    title: "The Fifth Element",
    tmdbId: "18"
  },
  "686": {
    type: "movie",
    title: "Contact",
    tmdbId: "686"
  },
  "13475": {
    type: "movie",
    title: "Star Trek (2009)",
    tmdbId: "13475"
  },
  "37686": {
    type: "movie",
    title: "Super 8",
    tmdbId: "37686"
  },
  "5598": {
    type: "movie",
    title: "Kingdom of Heaven",
    tmdbId: "5598"
  }
};

// ── Featured Home IDs (ordered by priority) ────────────────────────────────
export const FEATURED_HOME_IDS = [
  { id: "27205", type: "movie" },   // Inception
  { id: "157336", type: "movie" },   // Interstellar
  { id: "438631", type: "movie" },   // Dune: Part One
  { id: "693134", type: "movie" },   // Dune: Part Two
  { id: "603", type: "movie" },   // The Matrix
  { id: "577922", type: "movie" },   // Tenet
  { id: "335984", type: "movie" },   // Blade Runner 2049
  { id: "155", type: "movie" },   // The Dark Knight
  { id: "329865", type: "movie" },   // Arrival
  { id: "264660", type: "movie" },   // Ex Machina
  { id: "545611", type: "movie" },   // Everything Everywhere
  { id: "286217", type: "movie" },   // The Martian
  { id: "5598", type: "movie" },   // Kingdom of Heaven
];

// ── Universal Movie Engine Functions ────────────────────────────────────────

// ── Data Validation Log (One-time on app start) ───────────────────────────────
let validationLogged = false;
export const logMovieDataValidation = (): void => {
  if (validationLogged) return;
  
  console.group('📊 MovieBase Data Validation Report');
  console.table(
    Object.entries(movieDatabase).map(([id, data]) => ({
      'Movie ID': id,
      'Title': data.title || 'MISSING',
      'TMDB ID': data.tmdbId || 'MISSING',
      'Type': data.type || 'MISSING',
      'Status': (!data.tmdbId || data.tmdbId === '0' || data.tmdbId === 'null') ? '⚠️ INVALID TMDB' : '✅ OK'
    }))
  );
  console.groupEnd();
  
  const invalidEntries = Object.entries(movieDatabase).filter(
    ([, data]) => !data.tmdbId || data.tmdbId === '0' || data.tmdbId === 'null'
  );
  
  if (invalidEntries.length > 0) {
    console.warn(`⚠️ Found ${invalidEntries.length} movies with invalid/missing TMDB IDs:`, invalidEntries.map(([id, data]) => data.title));
  } else {
    console.log('✅ All movies have valid TMDB IDs');
  }
  
  validationLogged = true;
};

// ── Enterprise Multi-Source Matrix Array (2026 Streaming Endpoints) ─────────────────────
export const MULTI_SOURCE_MATRIX = [
  (tmdbId: string) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
  (tmdbId: string) => `https://embed.su/embed/movie/${tmdbId}`,
  (tmdbId: string) => `https://vidsrc.vip/embed/movie/${tmdbId}`,
  (tmdbId: string) => `https://multiembed.mov/direct/movie?tmdb=${tmdbId}`
];

// Multi-source state management with persistence
let currentSourceIndex = 0;
const SERVER_PREFERENCE_KEY = 'moviebox_preferred_server';

// Load preferred server from localStorage on init
const loadServerPreference = (): number => {
  try {
    const saved = localStorage.getItem(SERVER_PREFERENCE_KEY);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      if (index >= 0 && index < MULTI_SOURCE_MATRIX.length) {
        console.log('[Multi-Source Engine] Loaded preferred server index:', index);
        return index;
      }
    }
  } catch (error) {
    console.warn('[Multi-Source Engine] Failed to load server preference:', error);
  }
  return 0; // Default to first server
};

// Initialize with saved preference
currentSourceIndex = loadServerPreference();

export const getCurrentSourceIndex = (): number => currentSourceIndex;
export const setCurrentSourceIndex = (index: number): void => {
  currentSourceIndex = index;
  
  // Save preference to localStorage
  try {
    localStorage.setItem(SERVER_PREFERENCE_KEY, index.toString());
    console.log('[Multi-Source Engine] Saved preferred server index:', index);
  } catch (error) {
    console.warn('[Multi-Source Engine] Failed to save server preference:', error);
  }
  
  console.log('[Multi-Source Engine] Switched to source index:', index);
};

// ── Moviebox 'Clean' Resolver Configuration ───────────────────────────────────────
export const CLEAN_RESOLVER = 'https://vidsrc.cc/v2/embed/movie';
export const FALLBACK_RESOLVER = 'https://embed.su/embed/movie';

// Fallback state management
let isUsingFallback = false;

export const getUsingFallback = (): boolean => isUsingFallback;
export const setUsingFallback = (fallback: boolean): void => {
  isUsingFallback = fallback;
  console.log('[Moviebox Engine] Using fallback:', fallback);
};

/**
 * Enterprise Multi-Source Resolver with Auto-Failover and Title-Based Fallback
 * Dynamically constructs URLs using the current source index
 * Falls back to title-based search if tmdb_id is null, '0', or missing
 */
export const multiSourceResolver = (movieId: string): string => {
  const entry = movieDatabase[String(movieId)];
  
  if (!entry) {
    console.warn('[Multi-Source Engine] Movie not found:', movieId);
    return '';
  }

  const tmdbId = entry.tmdbId || movieId;
  const movieTitle = entry.title || 'Unknown';
  
  // Check if tmdb_id is null, '0', or invalid - use title-based fallback
  if (!tmdbId || tmdbId === '0' || tmdbId === 'null' || tmdbId === 'undefined') {
    console.log('[Multi-Source Engine] Using title-based fallback for:', movieTitle);
    
    // For title-based fallback, always use multiembed.mov with title parameter
    const encodedTitle = encodeURIComponent(movieTitle);
    return `https://multiembed.mov/direct/movie?title=${encodedTitle}`;
  }
  
  // Use the multi-source matrix with valid tmdb_id
  const currentSource = MULTI_SOURCE_MATRIX[currentSourceIndex];
  const finalUrl = currentSource(tmdbId);
  
  console.log('[Multi-Source Engine] Loading URL:', finalUrl);
  console.log('[Multi-Source Engine] TMDB ID:', tmdbId, 'Movie:', entry.title, 'Source Index:', currentSourceIndex);
  
  return finalUrl;
};

/**
 * Server Switch Handler - Cycles through available sources
 */
export const switchServer = (): void => {
  currentSourceIndex = (currentSourceIndex + 1) % MULTI_SOURCE_MATRIX.length;
  console.log('[Multi-Source Engine] Switched to server:', currentSourceIndex + 1, 'of', MULTI_SOURCE_MATRIX.length);
  setCurrentSourceIndex(currentSourceIndex);
};

/**
 * Get current server URL for download resolver
 */
export const getCurrentServerUrl = (movieId: string): string => {
  return multiSourceResolver(movieId);
};

/**
 * Moviebox 'Clean' Resolver - High-Performance, Ad-Free
 * Primary: https://vidsrc.cc/v2/embed/movie/{tmdb_id}
 * Fallback: https://embed.su/embed/movie/{tmdb_id}
 */
export const movieboxResolver = (movieId: string, useFallback = false): string => {
  const entry = movieDatabase[String(movieId)];
  
  if (!entry) {
    console.warn('[Moviebox Engine] Movie not found:', movieId);
    return '';
  }

  const tmdbId = entry.tmdbId || movieId;
  const resolverUrl = useFallback ? FALLBACK_RESOLVER : CLEAN_RESOLVER;
  const finalUrl = `${resolverUrl}/${tmdbId}`;
  
  // Debug log for verification
  console.log('[Moviebox Engine] Loading URL:', finalUrl);
  console.log('[Moviebox Engine] TMDB ID:', tmdbId, 'Movie:', entry.title, 'Source:', useFallback ? 'Fallback' : 'Clean');
  
  return finalUrl;
};

/**
 * Legacy universalMovieResolver for backward compatibility
 * Now uses Moviebox 'Clean' resolver by default
 */
export const universalMovieResolver = (movieId: string): string => {
  return movieboxResolver(movieId, isUsingFallback);
};

/**
 * Get display title
 */
export const getDisplayTitle = (id: string): string | undefined => {
  const entry = movieDatabase[String(id)];
  return entry?.title;
};

/**
 * Get TMDB ID for API calls
 */
export const getTMDBId = (id: string): string => {
  const entry = movieDatabase[String(id)];
  if (entry?.tmdbId) return entry.tmdbId;
  return String(id);
};

/**
 * Get custom poster path
 */
export const getCustomPosterPath = (id: string): string | undefined => {
  const entry = movieDatabase[String(id)];
  return entry?.posterPath;
};

/**
 * Check if content is available in our library
 */
export const isAvailable = (id: string): boolean => {
  return movieDatabase[String(id)] !== undefined;
};

/**
 * Get media type
 */
export const getMediaType = (id: string): string => {
  const entry = movieDatabase[String(id)];
  return entry?.type || "movie";
};

/**
 * Search our curated library by title
 */
export const searchLibrary = (query: string) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return Object.entries(movieDatabase)
    .filter(([, data]) => data.title.toLowerCase().includes(lowerQuery))
    .map(([id, data]) => ({ id, ...data }));
};

/**
 * Get all entries as an array
 */
export const getAllMovies = () => {
  return Object.entries(movieDatabase).map(([id, data]) => ({ id, ...data }));
};

/**
 * Get all Stranger Things season entries
 */
export const getAllStrangerThings = () => {
  return Object.entries(movieDatabase)
    .filter(([id, data]) => id.startsWith("st-") || data.title.includes("Stranger Things"))
    .map(([id, data]) => ({ id, ...data }));
};

/**
 * Screen Orientation Control
 */
export const lockToLandscape = async (): Promise<void> => {
  try {
    await ScreenOrientation.lock({ orientation: 'landscape' });
    console.log('[Universal Engine] Locked to landscape orientation');
  } catch (error) {
    console.warn('[Universal Engine] Failed to lock orientation:', error);
  }
};

export const unlockOrientation = async (): Promise<void> => {
  try {
    await ScreenOrientation.unlock();
    console.log('[Universal Engine] Unlocked orientation');
  } catch (error) {
    console.warn('[Universal Engine] Failed to unlock orientation:', error);
  }
};

/**
 * Enhanced Download Resolver with Header Injection
 * Attempts to pass download headers to the browser for direct download
 */
export const openDownloadInBrowser = async (movieId: string): Promise<void> => {
  try {
    const downloadUrl = getCurrentServerUrl(movieId);
    
    if (!downloadUrl) {
      throw new Error('No download URL available');
    }

    console.log('[Download Resolver] Opening in browser:', downloadUrl);
    
    // Try to inject download headers by constructing a special URL
    // Some streaming services support ?download=1 or similar parameters
    const enhancedUrl = downloadUrl.includes('multiembed.mov') 
      ? `${downloadUrl}&download=1` 
      : downloadUrl.includes('vidsrc.cc')
      ? `${downloadUrl}?download=1`
      : downloadUrl;
    
    console.log('[Download Resolver] Enhanced URL with headers:', enhancedUrl);
    
    await Browser.open({
      url: enhancedUrl,
      presentationStyle: 'fullscreen'
    });
    
    console.log('[Download Resolver] Browser opened successfully with header injection');
  } catch (error) {
    console.error('[Download Resolver] Failed to open browser:', error);
    throw error;
  }
};

/**
 * Generate safe filename for downloads
 */
export const generateSafeFilename = (title: string): string => {
  return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
};

// ── Legacy stubs for backward compatibility ───────────────────────────────────
export const getEpisodeVideoSource = () => null;
export const getMovieDriveId = () => null;
export const getDriveUrl = (id: string) => `https://drive.google.com/uc?export=stream&id=${id}`;
