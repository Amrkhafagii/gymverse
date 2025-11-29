import { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

type Props = {
  message?: string | null;
  onDismiss?: () => void;
  icon?: ReactNode;
};

export const ErrorBanner = ({ message, onDismiss, icon }: Props) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {icon}
        <Text style={styles.text}>{message}</Text>
      </View>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <X size={18} color="#E74C3C" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.35)',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    color: '#E74C3C',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    flexShrink: 1,
  },
});
