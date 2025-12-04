type DocumentPickerResult = {
  canceled: boolean;
  assets?: { uri: string; name?: string | null; size?: number | null; mimeType?: string | null }[];
};

export async function getDocumentAsync(
  options?: { type?: string | string[]; copyToCacheDirectory?: boolean }
): Promise<DocumentPickerResult> {
  try {
    // Dynamically import to avoid bundler errors when the module is unavailable
    const mod = await import('expo-document-picker');
    // @ts-ignore - runtime import
    if (mod?.getDocumentAsync) {
      // @ts-ignore - runtime call
      return mod.getDocumentAsync(options);
    }
  } catch (err) {
    console.warn('expo-document-picker not available, returning canceled result');
  }
  return { canceled: true, assets: [] };
}
