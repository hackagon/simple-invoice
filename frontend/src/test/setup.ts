import '@testing-library/jest-dom';

// jsdom does not implement navigation; stub it so the api 401 handler is safe.
Object.defineProperty(window, 'location', {
  value: { ...window.location, assign: () => {} },
  writable: true,
});
