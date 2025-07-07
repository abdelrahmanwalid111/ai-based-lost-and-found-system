import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = "http://10.0.2.2:3000";

const EditReportScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reportId } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [loading, setLoading] = useState(true);

  // Load report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/report/${reportId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const item = data.itemDetails;
          setTitle(item.title || '');
          setDescription(item.description || '');
          setCategory(item.category || '');
          setPrimaryColor(item.primaryColor || '');
          setSecondaryColor(item.secondaryColor || '');
        } else {
          Alert.alert("Error", "Failed to fetch report");
        }
      } catch (err) {
        Alert.alert("Error", err.message);
      }
      setLoading(false);
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/report/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemDetails: {
            title,
            description,
            category,
            primaryColor,
            secondaryColor
          }
        })
      });

      if (res.ok) {
        Alert.alert('Success', 'Report updated!');
        navigation.goBack();
      } else {
        const error = await res.json();
        Alert.alert('Update Failed', error.message || 'Could not update report');
      }
    } catch (err) {
      Alert.alert('Update Error', err.message);
    }
  };

  return (
  <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color='#1D3557' />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Report</Text>
                <View style={{ width: 24 }} />
        </View>
        


    <ScrollView contentContainerStyle={styles.container}>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Report Title"
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
            numberOfLines={3}
            style={[styles.input, { height: 80 }]}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
            style={styles.input}
          />

          <Text style={styles.label}>Primary Color</Text>
          <TextInput
            value={primaryColor}
            onChangeText={setPrimaryColor}
            placeholder="Primary Color"
            style={styles.input}
          />

          <Text style={styles.label}>Secondary Color</Text>
          <TextInput
            value={secondaryColor}
            onChangeText={setSecondaryColor}
            placeholder="Secondary Color"
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    paddingVertical: 36,
     paddingHorizontal: 20,
    backgroundColor: colors.background,
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
    container: {
    padding: 20,
    backgroundColor: "#F3F4F6",
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
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
    width: "90%",
    backgroundColor: "#1D3557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  }
});

export default EditReportScreen;
