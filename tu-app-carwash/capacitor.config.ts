import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'tu-app-carwash',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#FFFFFF',
      style: 'DARK'
    }
  }
};

export default config;
