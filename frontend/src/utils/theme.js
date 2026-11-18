const THEME_COOKIE = "theme";
const COOKIE_MAX_AGE_DAYS = 365;

export function getThemeCookie() {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`)
  );

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match[1]);
  return value === "dark" || value === "light" ? value : null;
}

export function setThemeCookie(theme) {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getPreferredTheme() {
  return getThemeCookie() || "light";
}

export function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  setThemeCookie(nextTheme);
  return nextTheme;
}

export function toggleTheme(currentTheme) {
  return applyTheme(currentTheme === "dark" ? "light" : "dark");
}
