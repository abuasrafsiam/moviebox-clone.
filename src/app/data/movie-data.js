/**
 * MovieBase — Curated Western Sci-Fi & Action Streaming Library
 * Flattened structure: each entry = one streamable title + YouTube trailer ID
 */

export const movieStreams = {

  // ── Stranger Things (all seasons as standalone entries) ──────────────────
  "st-season-1": {
    type: "tv",
    youtubeId: "mhhXKE9WoWA",
    title: "Stranger Things Season 1",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-2": {
    type: "tv",
    youtubeId: "V7EUMR4KBSQ",
    title: "Stranger Things Season 2",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-3": {
    type: "tv",
    youtubeId: "Wu_6ekD4SRc",
    title: "Stranger Things Season 3",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-4": {
    type: "tv",
    youtubeId: "oBkB6H2Lbkk",
    title: "Stranger Things Season 4",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },
  "st-season-5": {
    type: "tv",
    youtubeId: "Wu_6ekD4SRc",
    title: "Stranger Things Season 5",
    tmdbId: "66732",
    posterPath: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg"
  },

  // ── Primate (Home banner) ─────────────────────────────────────────────────
  "371608": {
    type: "movie",
    youtubeId: "k-D9F6bX400",
    title: "Primate"
  },

  // ── Sci-Fi Classics ───────────────────────────────────────────────────────
  "27205": {
    type: "movie",
    youtubeId: "YoHD9XEInc0",
    title: "Inception"
  },
  "157336": {
    type: "movie",
    youtubeId: "zSWdZVtXT7E",
    title: "Interstellar"
  },
  "438631": {
    type: "movie",
    youtubeId: "8g18jFHCLXk",
    title: "Dune: Part One"
  },
  "693134": {
    type: "movie",
    youtubeId: "Way9Dexny3w",
    title: "Dune: Part Two"
  },
  "603": {
    type: "movie",
    youtubeId: "vKQi3bBA1y8",
    title: "The Matrix"
  },
  "577922": {
    type: "movie",
    youtubeId: "L3pk_TBkihU",
    title: "Tenet"
  },
  "335984": {
    type: "movie",
    youtubeId: "gCcx85zWUXQ",
    title: "Blade Runner 2049"
  },
  "155": {
    type: "movie",
    youtubeId: "lNLmk7CPtOw&pp",
    title: "The Dark Knight"
  },
  "414906": {
    type: "movie",
    youtubeId: "mqqft2x_Aa4",
    title: "The Batman"
  },
  "329865": {
    type: "movie",
    youtubeId: "tFMo3UJ4B4g",
    title: "Arrival"
  },
  "264660": {
    type: "movie",
    youtubeId: "bggUmgeMCDc",
    title: "Ex Machina"
  },
  "545611": {
    type: "movie",
    youtubeId: "wxN1T1uxQ2g",
    title: "Everything Everywhere All At Once"
  },
  "286217": {
    type: "movie",
    youtubeId: "ej3ioOneTy8",
    title: "The Martian"
  },
  "137113": {
    type: "movie",
    youtubeId: "vw61gCe2oqI",
    title: "Edge of Tomorrow"
  },
  "324857": {
    type: "movie",
    youtubeId: "g4Hbz2jLxvQ",
    title: "Spider-Man: Into the Spider-Verse"
  },
  "569094": {
    type: "movie",
    youtubeId: "shW9i6k8cB0",
    title: "Spider-Man: Across the Spider-Verse"
  },
  "118340": {
    type: "movie",
    youtubeId: "d96cjJhvlMA",
    title: "Guardians of the Galaxy"
  },
  "17654": {
    type: "movie",
    youtubeId: "DyLUwOcR5pk",
    title: "District 9"
  },
  "9693": {
    type: "movie",
    youtubeId: "2VT2apoX9dg",
    title: "Children of Men"
  },
  "59967": {
    type: "movie",
    youtubeId: "2iQuhsmtfHw",
    title: "Looper"
  },
  "180": {
    type: "movie",
    youtubeId: "lG7D4TGiSko",
    title: "Minority Report"
  },
  "18": {
    type: "movie",
    youtubeId: "fQ9RqgcZ24g",
    title: "The Fifth Element"
  },
  "686": {
    type: "movie",
    youtubeId: "SRoO8m95Huc",
    title: "Contact"
  },
  "13475": {
    type: "movie",
    youtubeId: "iGAHnLhzvS0",
    title: "Star Trek (2009)"
  },
  "37686": {
    type: "movie",
    youtubeId: "tCRQQCKS7go",
    title: "Super 8"
  },
  "5598": {
    type: "movie",
    youtubeId: "nwRMa1RNDI",
    title: "Kingdom of Heaven"
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

/** Get YouTube trailer ID */
export const getYouTubeId = (id) => {
  const entry = movieStreams[String(id)];
  return entry?.youtubeId;
};

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