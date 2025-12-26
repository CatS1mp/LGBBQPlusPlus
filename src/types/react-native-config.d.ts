declare module 'react-native-config' {
  export interface NativeConfig {
    [name: string]: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

