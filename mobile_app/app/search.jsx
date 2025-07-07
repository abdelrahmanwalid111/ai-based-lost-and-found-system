import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, StatusBar, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../Utils/colors";


const Search = () => {
  const navigation = useNavigation();
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}> 
          <Ionicons name="arrow-back" size={35} color='#1D3557' />
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Please mention the item you lost</Text>
          <TextInput style={styles.input} placeholder="Item lost" />

          <Text style={styles.label}>Please describe the lost item in details</Text>
          <TextInput style={styles.textarea} placeholder="Describe the lost item" multiline />

          <Text style={styles.label}>Governorate</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedGovernorate}
              onValueChange={(itemValue) => setSelectedGovernorate(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Governorate" value="" />
              <Picker.Item label="Cairo" value="Cairo" />
              <Picker.Item label="Giza" value="Giza" />
              <Picker.Item label="Alexandria" value="Alexandria" />
            </Picker>
          </View>

          <Text style={styles.label}>City</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCity}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select City" value="" />
              <Picker.Item label="Nasr City" value="Nasr City" />
              <Picker.Item label="Dokki" value="Dokki" />
              <Picker.Item label="Smoha" value="Smoha" />
            </Picker>
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.textarea} placeholder="Address" multiline />

          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    
    paddingBottom: 20,
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
   
   
    marginTop:10,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.header,
    textAlign: "center",
    flex: 1,
  },
  form: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
  },
  searchButton: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#1f2b47",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default Search;
