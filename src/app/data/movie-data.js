/**
 * MovieBase — Curated Western Sci-Fi & Action Streaming Library
 * Multi-Source resolver engine - TMDB IDs only
 */

export const movieStreams = {

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

// ── Curated IDs to feature on the Home grid (ordered by priority) ──────────
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

// ── Helper functions ───────────────────────────────────────────────────────

/** Get display title */
export const getDisplayTitle = (id) => {
  const entry = movieStreams[String(id)];
  return entry?.title;
};

/** Get TMDB ID for API calls (ST entries store a separate tmdbId) */
export const getTMDBId = (id) => {
  const entry = movieStreams[String(id)];
  if (entry?.tmdbId) return entry.tmdbId;
  return String(id);
};

/** Get custom poster path (used for ST entries) */
export const getCustomPosterPath = (id) => {
  const entry = movieStreams[String(id)];
  return entry?.posterPath;
};

/** Check if content is available in our library */
export const isAvailable = (id) => {
  return movieStreams[String(id)] !== undefined;
};

/** Get media type */
export const getMediaType = (id) => {
  const entry = movieStreams[String(id)];
  return entry?.type || "movie";
};

/**
 * Search our curated library by title.
 * Returns an array of { id, ...data } objects.
 */
export const searchLibrary = (query) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return Object.entries(movieStreams)
    .filter(([, data]) => data.title.toLowerCase().includes(lowerQuery))
    .map(([id, data]) => ({ id, ...data }));
};

/** Get all entries as an array */
export const getAllMovies = () => {
  return Object.entries(movieStreams).map(([id, data]) => ({ id, ...data }));
};

/**
 * Get all Stranger Things season entries.
 * Kept for backward compatibility with Search.tsx.
 */
export const getAllStrangerThings = () => {
  return Object.entries(movieStreams)
    .filter(([id, data]) => id.startsWith("st-") || data.title.includes("Stranger Things"))
    .map(([id, data]) => ({ id, ...data }));
};

// ── Legacy stubs (Drive-based system removed) ──────────────────────────────
export const getEpisodeVideoSource = () => null;
export const getMovieDriveId = () => null;
export const getDriveUrl = (id) => `https://drive.google.com/uc?export=stream&id=${id}`;