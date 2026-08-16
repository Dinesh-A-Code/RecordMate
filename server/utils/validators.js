// Minimal hand-rolled validators — avoids pulling in an extra dependency
// (like Joi/Zod) for a small MVP form set.

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

export const isValidMode = (mode) => {
  return mode === "REQUESTER" || mode === "PROVIDER";
};

// Latitude/longitude must be finite numbers within real-world bounds.
export const isValidCoordinate = (latitude, longitude) => {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const isPositiveInteger = (value) => {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
};

export const isNonNegativeNumber = (value) => {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
};

// MVP radius cap — keeps nearby-matching queries (Phase 5) cheap and results
// realistically "hyperlocal".
export const MAX_RADIUS_KM = 50;

export const isValidRadius = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_RADIUS_KM
  );
};

export const isReasonableLength = (str, max) => {
  return typeof str === "string" && str.trim().length > 0 && str.trim().length <= max;
};

// Parses a date string/value and confirms it's a real date that isn't
// before today (same-day deadlines are allowed).
export const parseFutureOrTodayDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) return null;
  return date;
};

// Checks that every field name in `fields` exists on `body` and is a
// non-empty string. Returns an array of missing field names.
export const getMissingFields = (body, fields) => {
  return fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
};
