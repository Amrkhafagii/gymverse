import { Text, StyleSheet } from 'react-native';

type Props = {
  message?: string;
};

export const FormErrorText = ({ message }: Props) => {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
});
