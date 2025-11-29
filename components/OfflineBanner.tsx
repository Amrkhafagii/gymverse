import { StyleSheet, Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function OfflineBanner() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border || '#333' }]}>
      <WifiOff size={18} color={colors.text} />
      <Text style={[styles.text, { color: colors.text }]}>You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 100,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
});
