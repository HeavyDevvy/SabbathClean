import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.za.berryevents.app',
  appName: 'Berry Events',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https',
    androidScheme: 'https'
  }
};

export default config;

