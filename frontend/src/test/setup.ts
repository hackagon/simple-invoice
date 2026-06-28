import '@testing-library/jest-dom';

// jsdom does not implement navigation; stub it so the api 401 handler is safe.
Object.defineProperty(window, 'location', {
  value: { ...window.location, assign: () => {} },
  writable: true,
});

// jsdom does not implement matchMedia; stub it for the theme provider.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
