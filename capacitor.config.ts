import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daowallet.app',
  appName: 'daowallet',
  webDir: './packages/extension/public',
  bundledWebRuntime: false
};

export default config;
