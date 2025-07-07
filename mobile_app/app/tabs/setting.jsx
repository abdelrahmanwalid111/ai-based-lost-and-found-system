import React from "react";
import { colors } from "../../Utils/colors";

import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

const SettingsScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const handleManageProfile = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    router.replace("/welcome");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color='#1D3557' />
        </TouchableOpacity>
        <Text style={styles.title}>Setting</Text>
                <View style={{ width: 24 }} />
        </View>
        

        {/* Profile Section */}
        <TouchableOpacity
          style={[styles.profileContainer, { backgroundColor: "#E0E0E0" }]}
          onPress={handleManageProfile}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../assets/userpp.png")}
            style={styles.profileImage}
          />
          <Text style={styles.profileText}>Manage Profile</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              <Text style={styles.boldText}>0</Text> Lost
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.boldText}>0</Text> In-Progress
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.boldText}>0</Text> Found
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/manage")}>
            <Text style={styles.settingText}>Manage Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/settings/about")}>
            <Text style={styles.settingText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/settings/policies")}>
            <Text style={styles.settingText}>Policies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/settings/terms")}>
            <Text style={styles.settingText}>Terms & Conditions</Text>
          </TouchableOpacity>

          {/* ✅ Logout Button Now Goes to /welcome */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={styles.settingText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>App Version V 1.01</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
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
    marginBottom: 12,
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
  profileContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginHorizontal: 10,
  },
  boldText: {
    fontWeight: "600",
    color: "#1E293B",
  },
  settingsList: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginTop: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#1E293B",
    fontFamily: "Poppins_400Regular",
  },
  settingValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  versionText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
});

export default SettingsScreen;
