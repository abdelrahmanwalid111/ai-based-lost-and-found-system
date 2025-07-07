import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Welcome Image */}
      <Image source={require('../assets/welcome.png')} style={styles.image} />

      {/* Title */}
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.appName}>LostLink !</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Your Place for Lost & Found</Text>

      {/* Description */}
      <Text style={styles.description}>Lost Something? Let’s Help You Find It!</Text>

      {/* Login & Register Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.push('/Login')}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => router.push('/Signup')}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D3557',
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1D3557',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  loginButton: {
    backgroundColor: '#1D3557',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: '#1D3557',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#DADBDD',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  registerText: {
    color: '#1D3557',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
