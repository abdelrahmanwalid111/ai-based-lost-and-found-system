import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const TermsAndConditions = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#1E293B" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Terms & Conditions</Text>
        <Text style={styles.text}>
          By using the Lost and Found app, you agree to the following Terms and Conditions, which are designed to ensure a safe and trustworthy environment for all users:
        </Text>
        
        <Text style={styles.text}>
          📌 <Text style={styles.bold}>1. Purpose of the App:</Text>
          {'\n'}The app is intended to help users report lost and found items in an organized and community-driven platform. It is not liable for the accuracy of user-generated content.
        </Text>

        <Text style={styles.text}>
          👤 <Text style={styles.bold}>2. User Responsibilities:</Text>
          {'\n'}Users must provide truthful information when submitting reports. Any attempt to mislead, defraud, or manipulate the system is strictly prohibited and may result in account suspension.
        </Text>

        <Text style={styles.text}>
          🔐 <Text style={styles.bold}>3. Account and Security:</Text>
          {'\n'}You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any unauthorized access resulting from your failure to safeguard your login information.
        </Text>

        <Text style={styles.text}>
          📸 <Text style={styles.bold}>4. Content Ownership:</Text>
          {'\n'}You retain ownership of the images and descriptions you upload, but by submitting them, you grant us a non-exclusive license to display and use them for the functioning of the platform.
        </Text>

        <Text style={styles.text}>
          📵 <Text style={styles.bold}>5. Prohibited Activities:</Text>
          {'\n'}Users must not post content that is offensive, harmful, false, or infringes on the rights of others. Any violations will be subject to removal and possible legal action.
        </Text>

        <Text style={styles.text}>
          🛠️ <Text style={styles.bold}>6. Modifications and Termination:</Text>
          {'\n'}We reserve the right to modify or discontinue the app at any time without prior notice. We may also terminate or suspend access for users who violate these terms.
        </Text>

        <Text style={styles.text}>
          📬 <Text style={styles.bold}>7. Communication:</Text>
          {'\n'}By registering, you consent to receive essential notifications related to your account and reports. You can opt out of non-essential communication at any time.
        </Text>

        <Text style={styles.text}>
          📄 <Text style={styles.bold}>8. Legal Compliance:</Text>
          {'\n'}You agree to use the app in accordance with all applicable local, national, and international laws.
        </Text>

        <Text style={styles.text}>
          Use of the Lost and Found app constitutes your acceptance of these terms. If you do not agree, please refrain from using the application.
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

export default TermsAndConditions;
