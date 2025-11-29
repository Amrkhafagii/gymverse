import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CircleOff } from 'lucide-react-native';

type Props = {
  variant: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
};

export function ScreenState({ variant, title, message, onRetry, actionLabel }: Props) {
  const showAction = Boolean(onRetry);
  const label = actionLabel || 'Retry';

  return (
    <View style={styles.container}>
      {variant === 'loading' ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : variant === 'error' ? (
        <AlertTriangle size={48} color="#E74C3C" />
      ) : (
        <CircleOff size={48} color="#666" />
      )}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {variant === 'error' && showAction ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
