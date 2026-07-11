import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls the window back to the top whenever the route pathname changes,
 * so navigating to a new page always starts at the top instead of keeping
 * the previous page's scroll position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
