import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons"; // Expo icons
import { useRouter } from "expo-router";

export default function NewPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDone = async () => {
    // Validate password
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically make an API call to update the password
      console.log('Updating password');
      console.log('New password:', password);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to password updated screen
      router.push('/password_updated');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
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

      {/* Icon */}
      <FontAwesome5 name="pencil-alt" size={60} color="#1f2937" style={styles.icon} />

      {/* Title */}
      <Text style={styles.title}>New Password</Text>

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#555"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Done Button */}
      <TouchableOpacity 
        style={[styles.doneButton, isLoading && styles.doneButtonDisabled]} 
        onPress={handleDone}
        disabled={isLoading}
      >
        <Text style={styles.doneButtonText}>
          {isLoading ? 'Updating...' : 'Done'}
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
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1D3557",
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  input: {
    width: '90%',
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F41BB",
    borderRadius: 8,
    backgroundColor: "#F1F4FF",
    fontFamily: 'Poppins_400Regular',
  },
  doneButton: {
    width: "90%",
    backgroundColor: "#1D3557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonDisabled: {
    backgroundColor: "#ccc",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
