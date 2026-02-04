import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global ScrollToTop component that automatically scrolls to top on route changes.
 * Place this component inside the Router but outside of Routes.
 * 
 * @example
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>...</Routes>
 * </BrowserRouter>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
