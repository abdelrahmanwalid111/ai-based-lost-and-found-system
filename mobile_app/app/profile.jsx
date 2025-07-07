import React, { useState, useEffect } from "react";
import { colors } from "../Utils/colors";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_Regular: Poppins_400Regular,
    Poppins_Bold: Poppins_700Bold,
  });

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const API_BASE_URL = "http://10.0.2.2:3000"; // Or use your IPv4 if needed

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          firstname: data.user.firstname,
          lastname: data.user.lastname,
          username: data.user.username,
          email: data.user.email,
          profileImage: data.user.profileImage || "",
          currentPassword: "",
          newPassword: "",
        });
      } else {
        Alert.alert("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Load profile error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    console.log("🔥 handleSaveChanges triggered");

    if (!formData.firstname || !formData.lastname || !formData.username || !formData.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      Alert.alert("Error", "Please enter your current password to change it");
      return;
    }

    const updateData = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      username: formData.username,
      email: formData.email,
    };

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    console.log("👉 Data being sent:", updateData);

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log("📦 Server Response:", data);

      if (response.ok && data.success) {
        Alert.alert("Success", "Profile updated successfully");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
      } else {
        Alert.alert("Error", data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!fontsLoaded || initialLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
       <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color="#1D3557" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Pic (Optional) */}
      {/* <View style={styles.profilePicContainer}>
        {formData.profileImage ? (
          <Image
            source={{ uri: `${API_BASE_URL}${formData.profileImage}` }}
            style={styles.profilePic}
          />
        ) : (
          <Image
            source={require("./assets/userpp.png")}
            style={styles.profilePic}
          />
        )}
      </View> */}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#A0A0A0"
          value={formData.firstname}
          onChangeText={(value) => handleInputChange("firstname", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#A0A0A0"
          value={formData.lastname}
          onChangeText={(value) => handleInputChange("lastname", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#A0A0A0"
          value={formData.username}
          onChangeText={(value) => handleInputChange("username", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.passwordSection}>
        <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={formData.currentPassword}
          onChangeText={(value) => handleInputChange("currentPassword", value)}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={formData.newPassword}
          onChangeText={(value) => handleInputChange("newPassword", value)}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
     
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  header: {
      width: "100%",
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingHorizontal: 15,
    },
    backButton: {
      marginTop: 10,
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.header,
      textAlign: "center",
      flex: 1,
    },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontFamily: "Poppins_Bold",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#EEF1FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#A0A0A0",
    fontFamily: "Poppins_Regular",
  },
  passwordSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_Bold",
    marginBottom: 10,
    color: "#14213D",
  },
  saveButton: {
    backgroundColor: "#14213D",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_Bold",
  },
});
