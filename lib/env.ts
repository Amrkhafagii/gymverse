export const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    const message = `${name} is not set. Add it to your .env or app config.`;
    // Surface a helpful warning during development before throwing.
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(message);
    }
    throw new Error(message);
  }
  return value;
};

export const validateEnv = () => {
  const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] as const;
  required.forEach((key) => getRequiredEnv(key));
  return true;
};
