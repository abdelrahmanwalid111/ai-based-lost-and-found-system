import React, { useState, useEffect } from "react";
import { colors } from "../Utils/colors";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getUserId } from "../Utils/storage";
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Needed for token

const ReportItem = () => {
  const navigation = useNavigation();
  const [reportType, setReportType] = useState("lost");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [itemType, setItemType] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = {
    "Electronics": {
      "Phones": ["iPhone", "Android", "Flip Phone", "Smartphone"],
      "Computers": ["Laptop", "Desktop", "Tablet", "Chromebook"],
      "Audio": ["Headphones", "Earbuds", "Speakers", "Microphone"],
      "Cameras": ["DSLR", "Mirrorless", "Point-and-Shoot", "Action Cam"],
      "Gaming": ["Console", "Controller", "VR Headset", "Game Disc"]
    },
    "Clothing": {
      "Men's": ["Shirt", "Pants", "Jacket", "Shoes", "Suit"],
      "Women's": ["Dress", "Blouse", "Skirt", "Heels", "Handbag"],
      "Unisex": ["T-Shirt", "Jeans", "Hoodie", "Sneakers", "Cap"]
    },
    "Documents": {
      "Personal ID": ["Passport", "Driver's License", "National ID", "Student ID"],
      "Financial": ["Credit Card", "Debit Card", "Checkbook", "Bank Statement"],
      "Academic": ["Diploma", "Transcript", "Textbook", "Notebook"],
      "Travel": ["Boarding Pass", "Visa", "Hotel Reservation", "Travel Insurance"]
    },
    "Accessories": {
      "Jewelry": ["Necklace", "Ring", "Bracelet", "Earrings", "Watch"],
      "Bags": ["Backpack", "Purse", "Briefcase", "Wallet", "Luggage"],
      "Tech": ["Smartwatch", "Fitness Tracker", "Phone Case", "Charger"],
      "Misc": ["Glasses", "Umbrella", "Keychain", "Scarf"]
    },
    "Personal Items": {
      "Health": ["Medication", "Glasses", "Hearing Aid", "CPAP Machine"],
      "Kids": ["Pacifier", "Baby Bottle", "Diaper Bag", "Toy"],
      "Pet": ["Collar", "Leash", "ID Tag", "Carrier"]
    }
  };

  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableItemTypes, setAvailableItemTypes] = useState([]);

  useEffect(() => {
    if (category) {
      const subs = Object.keys(categoryOptions[category] || {});
      setAvailableSubCategories(subs);
      setSubCategory("");
      setAvailableItemTypes([]);
      setItemType("");
    }
  }, [category]);

  useEffect(() => {
    if (category && subCategory) {
      const types = categoryOptions[category]?.[subCategory] || [];
      setAvailableItemTypes(types);
      setItemType("");
    }
  }, [subCategory]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
      if (reverseGeocode.length > 0) {
        setCity(reverseGeocode[0].city);
        setAddress(reverseGeocode[0].name);
      }
    })();
  }, []);

  const pickImage = async (useCamera = false) => {
    let result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });

    if (!result.canceled) {
      if (Platform.OS !== "web") {
        setImage(result.assets[0].uri);
      } else {
        Alert.alert("Note", "Use the file input to upload image in browser.");
      }
    }
  };

  const debugValidation = () => {
    console.log("🔍 DEBUG: Testing validation without submission");
    console.log("Current form values:", {
      title: `${title}`,
      description: `${description}`,
      category: `${category}`,
      subCategory: `${subCategory}`,
      itemType: `${itemType}`,
      primaryColor: `${primaryColor}`,
      secondaryColor: `${secondaryColor}`,
      image: image ? "Image selected" : "No image"
    });

    const validationErrors = [];

    if (!title.trim()) validationErrors.push('Title');
    if (!description.trim()) validationErrors.push('Description');
    if (!category) validationErrors.push('Category');
    if (!subCategory) validationErrors.push('Subcategory');
    if (!itemType) validationErrors.push('Item Type');
    if (!primaryColor.trim()) validationErrors.push('Primary Color');
    if (!secondaryColor.trim()) validationErrors.push('Secondary Color');
    if (!image) validationErrors.push('Image');

    if (validationErrors.length > 0) {
      const errorMessage = `Missing fields:\n\n• ${validationErrors.join('\n• ')}`;
      Alert.alert('Debug: Validation Test', errorMessage);
    } else {
      Alert.alert('Debug: Validation Test', 'All fields are filled! ✅');
    }
  };

  const onSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("🚫 Already submitting - preventing duplicate submission");
      return;
    }

    console.log("🔍 Starting form validation...");

    // Form validation - check all required fields
    const validationErrors = [];

    // Check all required fields
    if (!title.trim()) validationErrors.push('Title');
    if (!description.trim()) validationErrors.push('Description');
    if (!category) validationErrors.push('Category');
    if (!subCategory) validationErrors.push('Subcategory');
    if (!itemType) validationErrors.push('Item Type');
    if (!primaryColor.trim()) validationErrors.push('Primary Color');
    if (!secondaryColor.trim()) validationErrors.push('Secondary Color');
    if (!image) validationErrors.push('Image');
    if (!location) validationErrors.push('Location');
    if (!city.trim()) validationErrors.push('City');
    if (!address.trim()) validationErrors.push('Address');

    // If there are validation errors, show them and return
    if (validationErrors.length > 0) {
      const errorMessage = `Please fill in the following required fields:\n\n• ${validationErrors.join('\n• ')}`;
      Alert.alert(
        '⚠️ Missing Information',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    console.log("✅ All validation passed - proceeding with submission");
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("reportType", reportType);
    formData.append("userId", await getUserId());
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("itemType", itemType);
    formData.append("primaryColor", primaryColor);
    formData.append("secondaryColor", secondaryColor);
    formData.append("latitude", location?.latitude?.toString() || "0");
    formData.append("longitude", location?.longitude?.toString() || "0");
    formData.append("city", city || "Unknown");
    formData.append("area", address || "Unknown");
    formData.append("lostDate", date.toISOString());

    if (image) {
      if (Platform.OS === "web") {
        formData.append("image", image); // File object from <input type="file" />
      } else {
        formData.append("image", {
          uri: image,
          name: "report.jpg",
          type: "image/jpeg",
        });
      }
    }

    // Get JWT token and use it in the Authorization header
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Not logged in', 'Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://100.65.0.126:3000/report", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await res.json();
      console.log("✅ Response:", result);

      if(res.ok) {
        // Show success popup
        Alert.alert(
          'Success! 🎉',
          'Your report has been submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setCategory('');
                setSubCategory('');
                setItemType('');
                setPrimaryColor('');
                setSecondaryColor('');
                setImage(null);
                setDate(new Date());
                
                // Navigate back to previous screen
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        // Show error message
        Alert.alert('Error', result.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error("❌ Submission error:", err.message);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPicker = (mode) => {
    if (mode === 'date') setShowDatePicker(true);
    else setShowTimePicker(true);
  };

  const onChangeDateTime = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setShowTimePicker(false);
    setDate(currentDate);
  };

  const renderInput = (label, placeholder, halfWidth = false, multiline = false, value, onChangeText) => (
    <View style={{ width: halfWidth ? "48%" : "100%", marginTop: 10 }}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80 }]}
        placeholder={placeholder}
        placeholderTextColor="#888"
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  const renderPicker = (label, selectedValue, onValueChange, options = [], disabled = false) => (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label} *</Text>
      <View style={[styles.pickerContainer, disabled && { opacity: 0.6 }]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          enabled={!disabled && options.length > 0}
        >
          <Picker.Item 
            label={options.length > 0 ? `Select ${label}` : "No options available"} 
            value="" 
          />
          {options.map((opt, idx) => (
            <Picker.Item label={opt} value={opt} key={idx} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={35} color="#1D3557" />
                </TouchableOpacity>
                <Text style={styles.title}>Report Item</Text>
                <View style={{ width: 24 }} />
              </View>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.instructions}>Please fill in the details of the item you {reportType}. All fields marked with * are required.</Text>

        <View style={styles.form}>
          {renderPicker("Report Type", reportType, setReportType, ["lost", "found"])}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => {
              if (Platform.OS === "web") {
                document.getElementById("webImageInput").click();
              } else {
                pickImage(false);
              }
            }}>
              <Text style={styles.buttonText}>Upload Image *</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => pickImage(true)}>
              <Text style={styles.buttonText}>Take Photo *</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === "web" && (
            <input
              id="webImageInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImage(file);
                }
              }}
            />
          )}

          {image && (
            <Image source={{ uri: image }} style={{ width: "100%", height: 200, borderRadius: 10, marginTop: 10 }} />
          )}

          {renderInput("Title", "Item title", false, false, title, setTitle)}

          <View style={styles.row}>
            <TouchableOpacity onPress={() => showPicker('date')} style={{ width: "48%", marginTop: 10 }}>
              <Text style={styles.label}>Date *</Text>
              <Text style={styles.input}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showPicker('time')} style={{ width: "48%", marginTop: 10 }}>
              <Text style={styles.label}>Time *</Text>
              <Text style={styles.input}>{date.toLocaleTimeString()}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDateTime}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onChangeDateTime}
            />
          )}

          {renderInput("Description", "Describe the item", false, true, description, setDescription)}

          {renderPicker("Category", category, setCategory, Object.keys(categoryOptions))}

          {category && renderPicker("Subcategory", subCategory, setSubCategory, availableSubCategories)}

          {subCategory && renderPicker("Item Type", itemType, setItemType, availableItemTypes)}

          {renderInput("Primary Color", "Item primary color", false, false, primaryColor, setPrimaryColor)}
          {renderInput("Secondary Color", "Item secondary color", false, false, secondaryColor, setSecondaryColor)}

          {/* Location Display */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={20} color="#1D3557" />
                <Text style={styles.locationText}>
                  {city && address ? `${address}, ${city}` : "Getting location..."}
                </Text>
              </View>
              {location && (
                <Text style={styles.coordinatesText}>
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </Text>
              )}
              <TouchableOpacity 
                style={styles.refreshLocationButton}
                onPress={async () => {
                  try {
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc.coords);
                    const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);
                    if (reverseGeocode.length > 0) {
                      setCity(reverseGeocode[0].city || "Unknown City");
                      setAddress(reverseGeocode[0].name || "Unknown Address");
                    }
                    Alert.alert("✅ Success", "Location updated successfully!");
                  } catch (error) {
                    Alert.alert("❌ Error", "Failed to get location. Please try again.");
                  }
                }}
              >
                <Ionicons name="refresh-outline" size={16} color="#1D3557" />
                <Text style={styles.refreshLocationText}>Refresh Location</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    
  );
};

const styles = {
  safeContainer: {
     flex: 1, 
     backgroundColor: "#fff" ,
     paddingVertical: -12,
     paddingHorizontal: 20,
    },
  instructions: { 
    fontSize: 16, 
    color: "#555", 
    marginBottom: 10 },
 
  scrollContainer: { 
    borderRadius: 10,
    padding: 20 ,
    backgroundColor: "#F3F4F6",
  },
   form: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", color: "#333" },
  input: { height: 40, borderColor: "#1F41BB", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginVertical: 5 },
  
  pickerContainer: { 
    borderColor: "#1F41BB", 
    borderWidth: 1, 
    borderRadius: 8, 
    marginVertical: 5,
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
  picker: { 
    height: 50, 
    width: "100%",
    color: "#333",
    fontSize: 16
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { backgroundColor: "#1D3557", padding: 10, borderRadius: 5, width: "48%" },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 14 },
  submitButton: { backgroundColor: "#1D3557", padding: 15, borderRadius: 5, marginTop: 20 },
  submitButtonDisabled: { backgroundColor: "#ccc" },
  submitButtonText: { color: "#fff", textAlign: "center", fontSize: 18 },
  locationContainer: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1
  },
  coordinatesText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8
  },
  refreshLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 5,
    alignSelf: "flex-start"
  },
  refreshLocationText: {
    fontSize: 12,
    color: "#1D3557",
    marginLeft: 4
  }
};

export default ReportItem;