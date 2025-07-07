import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const AboutScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>About the Lost & Found App</Text>
        <Text style={styles.text}>
          Welcome to the Lost & Found app! Our mission is to help people reunite with their lost belongings and assist those who have found items in returning them to their rightful owners. Whether you've lost something valuable or found an item, our platform makes it easy to report and track lost and found items in your local community.
        </Text>
        
        <Text style={styles.subHeader}>How It Works</Text>
        <Text style={styles.text}>
          The process is simple:
        </Text>
        <Text style={styles.text}>
          1. **Report a Lost Item**: If you've lost something, create a report detailing the item, location, and any identifying features.
        </Text>
        <Text style={styles.text}>
          2. **Found Items**: If you've found an item, you can easily post details so the rightful owner can reach out.
        </Text>
        <Text style={styles.text}>
          3. **Track Your Reports**: Stay updated on the status of your lost or found item, whether it's marked as "In Progress" or "Found."
        </Text>

        <Text style={styles.subHeader}>Privacy & Security</Text>
        <Text style={styles.text}>
          We take your privacy seriously. All information shared through our app is securely stored, and we ensure that your contact details are kept private unless you're directly connected to someone else's item.
        </Text>

        <Text style={styles.subHeader}>Support</Text>
        <Text style={styles.text}>
          If you need help using the app or have any questions, please reach out to our support team. We're here to help you!
        </Text>

        <Text style={styles.subHeader}>Our Vision</Text>
        <Text style={styles.text}>
          Our vision is to create a community-driven platform that simplifies the process of reconnecting lost items with their owners. By using our app, you contribute to a safer and more connected community.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default AboutScreen;
