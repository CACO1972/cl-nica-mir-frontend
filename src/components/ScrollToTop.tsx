import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global ScrollToTop component that automatically scrolls to top on route changes.
 * Uses useLayoutEffect to scroll BEFORE the browser paints, ensuring
 * the page always appears from the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  // useLayoutEffect runs synchronously before the browser paints
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // Fallback with useEffect for any edge cases
  useEffect(() => {
    // Small delay to handle any late-rendering content
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
