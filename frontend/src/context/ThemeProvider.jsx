// Legacy ThemeProvider (JS) deprecated in favor of TypeScript version (ThemeProvider.tsx).
// Kept as a lightweight shim to avoid import breakage while migrating all imports.
// If any component still imports from this file, re-export the TS implementation.
export * from './ThemeProvider.tsx';
export { default } from './ThemeProvider.tsx';
