import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons"; // Back icon
import { MaterialIcons } from "@expo/vector-icons"; // Phone & Email icons
import { useRouter } from "expo-router"; // For navigation

const SelectionScreen = () => {
  const router = useRouter(); // Navigation handler

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="gray" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Make</Text>
      <Text style={styles.title}>Selection</Text>

      {/* Selection Options */}
      <View style={styles.optionsContainer}>
        {/* Phone Option */}
        <View style={styles.optionCard}>
          <MaterialIcons name="phone-iphone" size={32} color="gray" style={styles.icon} />
          <View>
            <Text style={styles.optionTitle}>Via Phone</Text>
            <Text style={styles.optionText}>+20 1001234567</Text>
          </View>
        </View>

        {/* Email Option */}
        <View style={styles.optionCard}>
          <MaterialIcons name="email" size={32} color="gray" style={styles.icon} />
          <View>
            <Text style={styles.optionTitle}>Via Email</Text>
            <Text style={styles.optionText}>example@gmail.com</Text>
          </View>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={() => router.push("/next-screen")}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    width: "100%",
    maxWidth: 300,
  },
  optionsContainer: {
    marginTop: 20,
    width: "100%",
    maxWidth: 300,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  optionText: {
    fontSize: 14,
    color: "#555",
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: "#1d3557",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
