import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { saveUserId } from '../Utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://100.65.0.126:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Successfully logged in!");
        console.log("Token:", data.token);

        await AsyncStorage.setItem('token', data.token);
        await saveUserId(data.id);

        navigation.replace("tabs");
      } else {
        console.log("❌ Login Failed:", data.error);
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}> 
        <FontAwesome name="arrow-left" size={24} color="#0f1d3b" />
      </TouchableOpacity>

      <Text style={styles.title}>Login here</Text>
      <Text style={styles.subtitle}>Welcome back! You've been missed!</Text>
      

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
    <TouchableOpacity onPress={() => navigation.navigate('Forget_Password')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FAF9F6",
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
    marginBottom: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: "center",
    marginBottom: 20,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  loginButton: {
    width: "90%",
    backgroundColor: "#1D3557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotText: {
    marginTop: 15,
    color: "#0f1d3b",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
