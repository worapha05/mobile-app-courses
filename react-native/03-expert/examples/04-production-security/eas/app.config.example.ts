/**
 * ตัวอย่าง app.config.ts แบบ multi-environment
 * คัดลอกแนวคิดไปใช้ใน project จริง
 */
import type { ExpoConfig, ConfigContext } from 'expo/config';

type AppEnv = 'development' | 'staging' | 'production';

const ENV = (process.env.APP_ENV as AppEnv) || 'development';

const envMap: Record<AppEnv, { name: string; bundle: string; apiUrl: string; channel: string }> = {
  development: {
    name: 'FieldShelf Dev',
    bundle: 'com.fieldshelf.app.dev',
    apiUrl: 'https://dev.api.fieldshelf.example',
    channel: 'development',
  },
  staging: {
    name: 'FieldShelf Staging',
    bundle: 'com.fieldshelf.app.staging',
    apiUrl: 'https://staging.api.fieldshelf.example',
    channel: 'staging',
  },
  production: {
    name: 'FieldShelf',
    bundle: 'com.fieldshelf.app',
    apiUrl: 'https://api.fieldshelf.example',
    channel: 'production',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const current = envMap[ENV];
  return {
    ...config,
    name: current.name,
    slug: 'fieldshelf',
    scheme: 'fieldshelf',
    newArchEnabled: true,
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: current.bundle,
      supportsTablet: true,
    },
    android: {
      package: current.bundle,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/<your-project-id>',
    },
    extra: {
      appEnv: ENV,
      apiUrl: current.apiUrl,
      eas: { projectId: '<your-project-id>' },
    },
    plugins: ['expo-secure-store', 'expo-local-authentication', './plugins/withPartnerMetadata'],
  };
};
