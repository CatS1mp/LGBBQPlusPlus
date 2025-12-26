export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
} as const;

export function getLocalizedRoute(route: string, locale: string): string {
  return `/${locale}${route === '/' ? '' : route}`;
}

