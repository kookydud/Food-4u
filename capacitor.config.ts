import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'food4u',
  webDir: 'www',
  plugins: {
    SystemBars: {
      // Expose the status/gesture bar sizes to CSS as --safe-area-inset-* (used in global.scss).
      insetsHandling: 'css',
      // Dark status-bar icons, since most pages have a light background.
      style: 'LIGHT',
    },
  },
};

export default config;
