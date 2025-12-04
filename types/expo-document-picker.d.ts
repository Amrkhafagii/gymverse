declare module 'expo-document-picker' {
  export type DocumentPickerAsset = {
    uri: string;
    name?: string | null;
    size?: number | null;
    mimeType?: string | null;
  };

  export type DocumentPickerResult = {
    canceled: boolean;
    assets?: DocumentPickerAsset[];
  };

  export function getDocumentAsync(options?: {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }): Promise<DocumentPickerResult>;
}
