import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNext = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically make an API call to send the reset email
      // For now, we'll simulate the process and navigate to OTP screen
      console.log('Sending reset email to:', email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to OTP screen
      router.push('/OTP');
    } catch (error) {
      console.error('Error sending reset email:', error);
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> 
        <FontAwesome name="arrow-left" size={24} color="#0f1d3b" />
      </TouchableOpacity>

      {/* Background Shapes
      <View style={styles.backgroundCircle} />
      <View style={styles.backgroundLines} /> */}

      {/* Lock Icon */}
      <View style={styles.lockIconContainer}>
        <Image source={require('../assets/forgot.png')} style={styles.lockIcon} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Forgot Password</Text>

      {/* Input Field */}
      <TextInput 
        style={styles.input} 
        placeholder="Username/Email" 
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
        onPress={handleNext}
        disabled={isLoading}
      >
        <Text style={styles.nextButtonText}>
          {isLoading ? 'Sending...' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    alignItems: 'center',
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 130,
    left: 30,
  },
  // backgroundCircle: {
  //   position: 'absolute',
  //   top: -50,
  //   right: -100,
  //   width: 250,
  //   height: 250,
  //   backgroundColor: '#F2F3F5',
  //   borderRadius: 125,
  // },
  // backgroundLines: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   width: '100%',
  //   height: 150,
  //   backgroundColor: 'transparent',
  //   borderTopWidth: 1,
  //   borderTopColor: '#E0E0E0',
  // },
  lockIconContainer: {
    marginTop: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1D3557",
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  input: {
    width: '80%',
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F41BB",
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    fontFamily: 'Poppins_400Regular',
  },
  nextButton: {
     width: "80%",
    backgroundColor: "#1D3557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D1D1',
  },
});

export default ForgotPasswordScreen;