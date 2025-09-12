import { NavigateFunction } from 'react-router-dom';

/**
 * Safe navigation utility that uses React Router instead of window.location
 * Prevents full page reloads and maintains SPA behavior
 */
export class SafeNavigation {
  private static navigate: NavigateFunction | null = null;

  static setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  static to(path: string, options?: { replace?: boolean; state?: any }) {
    if (this.navigate) {
      this.navigate(path, options);
    } else {
      // Fallback to window.location only if navigate is not available
      console.warn('SafeNavigation: navigate not set, falling back to window.location');
      if (options?.replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  }

  static replace(path: string, state?: any) {
    this.to(path, { replace: true, state });
  }

  static reload() {
    if (this.navigate) {
      // Force a navigate to current location to refresh data
      this.navigate(window.location.pathname, { replace: true });
    } else {
      window.location.reload();
    }
  }

  static getOrigin(): string {
    return window.location.origin;
  }

  static getCurrentHref(): string {
    return window.location.href;
  }
}

// Export convenience functions
export const navigateTo = (path: string, options?: { replace?: boolean; state?: any }) => 
  SafeNavigation.to(path, options);

export const navigateReplace = (path: string, state?: any) => 
  SafeNavigation.replace(path, state);

export const getOrigin = () => SafeNavigation.getOrigin();
export const getCurrentHref = () => SafeNavigation.getCurrentHref();