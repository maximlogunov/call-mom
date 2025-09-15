import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { WebRTCDemo } from './src/components/WebRTCDemo';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebRTCDemo />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
