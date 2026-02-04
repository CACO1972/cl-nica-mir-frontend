import { useEffect, useRef, useCallback } from "react";

interface UseRevealOnScrollOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

/**
 * Hook that triggers reveal animations when elements enter the viewport.
 * Works with .reveal-element class from the design system.
 * 
 * @example
 * // Single element
 * const ref = useRevealOnScroll<HTMLDivElement>();
 * <div ref={ref} className="reveal-element">Content</div>
 * 
 * @example
 * // Multiple elements with stagger
 * const containerRef = useRevealOnScroll<HTMLDivElement>({ 
 *   threshold: 0.2,
 *   delay: 100 // stagger delay between children
 * });
 * <div ref={containerRef}>
 *   <div className="reveal-element">Item 1</div>
 *   <div className="reveal-element">Item 2</div>
 * </div>
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>(
  options: UseRevealOnScrollOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once = true,
    delay = 0,
  } = options;

  const elementRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Find all reveal elements (self or children)
    const revealElements = element.classList.contains("reveal-element")
      ? [element]
      : Array.from(element.querySelectorAll(".reveal-element"));

    if (revealElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Apply stagger delay if specified
            if (delay > 0) {
              const index = revealElements.indexOf(target);
              target.style.transitionDelay = `${index * delay}ms`;
            }

            // Trigger the reveal animation
            target.classList.add("revealed");

            // Unobserve if once is true
            if (once && observerRef.current) {
              observerRef.current.unobserve(target);
            }
          } else if (!once) {
            // Reset animation when leaving viewport
            entry.target.classList.remove("revealed");
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe all reveal elements
    revealElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, once, delay]);

  return elementRef;
}

/**
 * Hook for observing multiple independent sections
 */
export function useRevealOnScrollCallback(
  options: UseRevealOnScrollOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            if (once && observerRef.current) {
              observerRef.current.unobserve(entry.target);
              elementsRef.current.delete(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove("revealed");
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe any elements that were registered before observer was created
    elementsRef.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, once]);

  const observe = useCallback((element: Element | null) => {
    if (!element) return;
    elementsRef.current.add(element);
    observerRef.current?.observe(element);
  }, []);

  return observe;
}

export default useRevealOnScroll;
