// This is a workaround for a jsdom limitation where getComputedStyle is not
// fully implemented, especially for pseudo-elements. Accessibility tools like
// axe-core can trigger this error. We are mocking it to return a basic
// object to prevent the test runner from crashing.
// For more context, see: https://github.com/jsdom/jsdom/issues/1754

if (typeof window !== 'undefined') {
  const { getComputedStyle } = window;
  Object.defineProperty(window, 'getComputedStyle', {
    value: (elt: Element, pseudoElt?: string | null) => {
      // If a pseudo-element is requested, return a mock style object.
      // This is the part jsdom doesn't implement.
      if (pseudoElt) {
        return {
          getPropertyValue: (_prop: string) => {
            return '';
          }
        };
      }
      // For regular elements, fall back to the original implementation.
      return getComputedStyle(elt);
    },
  });
}