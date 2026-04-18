import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 3000); // 3s splash
    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require('../assets/animacao.json')}
          autoPlay
          loop={false}
          style={{ width: 250, height: 250 }}
        />
      </View>
    );
  }

  return <>{children}</>; // Aqui carrega o layout normal (Tabs)
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
});
