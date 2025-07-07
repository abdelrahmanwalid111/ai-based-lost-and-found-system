import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { saveUserId } from '../Utils/storage';

SplashScreen.preventAutoHideAsync();

// firebase

const SignupScreen = () => {
  const navigation = useNavigation(); // ✅ React Navigation for screen transitions
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  } else {
    SplashScreen.hideAsync();
  }

  const handleRegister = async () => {
    if (!firstname || !lastname || !username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      const response = await fetch("http://100.65.0.126:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      setLoading(false); // Stop loading indicator

      if(response.status == 203) {
        Alert.alert("Registration Failed", data.message || "Something went wrong.");
      } else if (response.ok) {
        //Alert.alert("Success", "Registration successful!");
        
        console.log(data.token)
        console.log(data.message)
        await saveUserId(data.id);
        navigation.navigate("tabs"); // ✅ Navigate to Login screen after registration
      } 
    } catch (error) {
      setLoading(false);
      console.error("Registration Error:", error);
      print(error)
      Alert.alert("Error", `${error} Could not connect to the server. Please try again later.`);
    }
  };

  return (
    
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={24} color="#1D3557" />
      </TouchableOpacity>

      <Text style={styles.header}>Create Account</Text>
      <Text style={styles.subHeader}>Join a Community That Finds Together</Text>
      
      {/* Input Fields */}
      <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Already have an account?</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or continue with</Text>

      {/* Social Media Icons */}
      <View style={styles.socialIcons}>
        <FontAwesome name="google" size={24} color="black" style={styles.icon} />
        <FontAwesome name="facebook" size={24} color="black" style={styles.icon} />
        <FontAwesome name="apple" size={24} color="black" style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FAF9F6",
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 130,
    left: 30,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 5,
    color: "#1D3557",
    fontFamily: 'Poppins_600SemiBold',
  },
  subHeader: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
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
  button: {
    width: '90%',
    backgroundColor: "#1D3557",
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
  },
  footerText: {
    marginTop: 30,
    color: '#6B6B6B',
    fontFamily: 'Poppins_400Regular',
  },
  loginText: {
    color: '#1D3557',
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
  },
  orText: {
    marginTop: 18,
    color: '#6B6B6B',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default SignupScreen;