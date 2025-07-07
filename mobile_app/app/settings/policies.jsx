import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

const PoliciesScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Privacy Policy & Data Protection</Text>
        <Text style={styles.text}>
          At Lost and Found, we are committed to protecting your privacy and ensuring the security of your personal information. This policy outlines how we collect, use, and safeguard your data when you use our application.
        </Text>

        <Text style={styles.text}>
          {"\n"}🔒 <Text style={styles.bold}>Data Collection:</Text>
          {"\n"}We collect only the information necessary to provide our services, including your name, email address, and location data when you report lost or found items. This information is used solely for the purpose of connecting lost items with their owners.
        </Text>

        <Text style={styles.text}>
          {"\n"}📱 <Text style={styles.bold}>How We Use Your Information:</Text>
          {"\n"}Your information is used to create and manage reports, facilitate communication between users, and improve our services. We do not sell, trade, or share your personal information with third parties without your explicit consent.
        </Text>

        <Text style={styles.text}>
          {"\n"}🛡️ <Text style={styles.bold}>Data Security:</Text>
          {"\n"}We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. All data is encrypted and stored securely on our servers.
        </Text>

        <Text style={styles.text}>
          {"\n"}📞 <Text style={styles.bold}>Contact and Support:</Text>
          {"\n"}For any questions regarding our policies or to request data deletion, please contact our support team through the app or email us directly.
        </Text>

        <Text style={styles.text}>
          {"\n"}By using the Lost and Found app, you agree to abide by these policies. We may update them periodically, and continued use of the app constitutes acceptance of any changes.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '600',
    color: '#1E293B',
  },
});

export default PoliciesScreen;
