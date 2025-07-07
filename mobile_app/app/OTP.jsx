import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { useState, useRef } from "react";
import { FontAwesome } from "@expo/vector-icons"; // Use Expo's vector icons
import { useRouter } from "expo-router";

export default function OtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]); // OTP state
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef([]); // Refs for handling input focus

  const handleOtpChange = (text, index) => {
    if (text.length > 1) text = text.charAt(0); // Ensure only one digit

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to the next input automatically
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleNext = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically verify the OTP with your backend
      console.log('Verifying OTP:', otpString);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to new password screen
      router.push('/new_password');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP. Please try again.');
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

      {/* Title */}
      <Text style={styles.title}>Enter the OTP</Text>

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputs.current[index] = el)} // Store ref
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
                inputs.current[index - 1].focus();
              }
            }}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
        onPress={handleNext}
        disabled={isLoading}
      >
        <Text style={styles.nextButtonText}>
          {isLoading ? 'Verifying...' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 130,
    left: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1D3557",
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    
    marginTop: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: "#F1F4FF",
    borderColor: "#1F41BB",
  },
  nextButton: {
    width: "60%",
    backgroundColor: "#1D3557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop:20 ,
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
