import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animacao.json')} // ajuste para o caminho correto da sua animação
        autoPlay
        loop={false}
        style={{ width: 250, height: 250 }}
        onAnimationFinish={() => {
          router.replace('/(tabs)'); // navega para suas tabs após animação
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
});
