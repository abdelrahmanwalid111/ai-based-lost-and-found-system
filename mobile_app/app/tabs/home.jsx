import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const Homescreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.replace("Login"); // 🔄 Ensure proper logout behavior
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Home</Text>
        
        {/* Header Section */}
        <View style={[styles.header, darkMode && styles.darkHeader]}>
          <Pressable onPress={() => navigation.navigate("profile")}>
          <Image
            source={require("../../assets/userpp.png")}
            style={styles.profileImage} onPress={() => navigation.navigate("profile")}
          />
          </Pressable>
          <View style={styles.rightIcons} >
            <Text style={styles.darkModeText}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
            <TouchableOpacity>
              <FontAwesome name="bell-o" size={24} color={darkMode ? "#fff" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Main Section */}
      <View style={styles.main}>
        <Button title="Report Lost/Found" primary onPress={() => navigation.navigate("report_found")} />
        <Text style={[styles.subtitle, darkMode && styles.darkText]}>Manage Reports</Text>
        <Button title="Manage Reports" onPress={() => navigation.navigate("manage")} />
      </View>
    </View>
  );
};

const Button = ({ title, primary, onPress }) => (
  <TouchableOpacity style={[styles.button, primary && styles.primaryButton]} onPress={onPress}>
    <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  darkContainer: {
    backgroundColor: "#222",
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 10,
    color: "#1F2B47",
  },
  darkText: {
    color: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  darkHeader: {
    backgroundColor: "#333",
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  darkModeText: {
    fontSize: 14,
    color: "#777",
  },
  main: {
    alignItems: "center",
    marginTop: 80,
    padding: 20,
  },
  button: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  primaryButton: {
    backgroundColor: "#1F2B47",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2B47",
  },
  primaryButtonText: {
    color: "#FFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginTop: 10,
  },
});

export default Homescreen;
