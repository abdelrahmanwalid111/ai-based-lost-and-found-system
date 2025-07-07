import React, { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../Utils/colors"; // Make sure this path is correct
import axios from "axios";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert(
            "Authentication Required",
            "You are not logged in. Please log in to use the chatbot.",
            [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
          );
        }
      } catch (e) {
        console.error("Failed to load token:", e);
        Alert.alert("Error", "Could not load user session.");
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(loc.coords);
        } catch (err) {
          console.error("Location error:", err);
        }
      }

      setMessages([
        {
          from: "bot",
          text: `Hi there! I'm Lino, your Lost & Found assistant. How can I help you today?`,
          quick_replies: [
            "Report Lost Item",
            "Report Found Item",
            "Show Reports Status",
            "Show Terms",
            "Show FAQs",
          ],
        },
      ]);
    };

    initializeChat();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleImagePick = async (sourceType) => {
    let result;
    let cameraPermissionGranted = true;
    let galleryPermissionGranted = true;

    if (sourceType === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take photos.");
        cameraPermissionGranted = false;
      }
      if (cameraPermissionGranted) {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.7,
          base64: true,
        });
      }
    } else if (sourceType === "gallery") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery access is needed to pick photos.");
        galleryPermissionGranted = false;
      }
      if (galleryPermissionGranted) {
        result = await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
          base64: true,
        });
      }
    }

    if (result && !result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPendingImage(base64Image);
      setMessages((prev) => [
        ...prev,
        { from: "me", text: "Photo selected." }, // Indicate a photo was selected
        {
          from: "bot",
          text: "Do you want to send this photo?",
          quick_replies: ["Yes", "Cancel"],
        },
      ]);
    } else if (result && result.canceled) {
        setMessages(prev => [
            ...prev,
            { from: "bot", text: "Photo selection cancelled. Please try again or skip.", quick_replies: ["Upload photo", "Take a photo", "Skip"] }
        ]);
    }
  };


  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() && !pendingImage) return;

    const userMessage = { from: "me", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const API_URL = "http://100.64.106.78:5000/chat";

      const payload = {
        message: messageText,
        lat: location?.latitude,
        lng: location?.longitude,
      };

      const res = await axios.post(API_URL, payload, config);

      if (res.status === 200) {
        const botMessage = {
          from: "bot",
          text: res.data.reply,
          quick_replies: res.data.quick_replies || [],
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Unexpected server response. Please try again.",
            quick_replies: [],
          },
        ]);
      }
    } catch (err) {
      let errorMessage = "Oops! Something went wrong.";
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (axios.isAxiosError(err) && err.code === "ERR_NETWORK") {
        errorMessage = "Network error. Check your connection.";
      }
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: errorMessage, quick_replies: [] },
      ]);
    } finally {
      setIsLoading(false);
      setPendingImage(null); // Clear pending image after sending or error
    }
  };

  const handleQuickReply = (text) => {
    if (text === "Yes" && pendingImage) {
      sendMessage(pendingImage); // Send the pending image
      return;
    }
    if (text === "Cancel" && pendingImage) {
      setPendingImage(null);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Upload cancelled.", quick_replies: [] },
      ]);
      return;
    }
    // Handle photo specific quick replies
    if (text === "Upload photo") {
      handleImagePick("gallery");
      return;
    }
    if (text === "Take a photo") {
      handleImagePick("camera");
      return;
    }

    // For other quick replies, set the input and send the message
    setInput(text);
    sendMessage(text);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={35} color={colors.header || "#1D3557"} />
        </TouchableOpacity>
        <Text style={styles.title}>Lino</Text>
        <View style={{ width: 35 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContentContainer}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.from === "me" ? styles.myBubble : styles.botBubble,
              ]}
            >
              {msg.text.startsWith("data:image") ? (
                <Image
                  source={{ uri: msg.text }}
                  style={{ width: 200, height: 200, borderRadius: 12 }}
                />
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    msg.from === "me" ? styles.myMessageText : styles.botMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              )}
            </View>
          ))}

          {/* Display pending image if available */}
          {pendingImage && (
            <View style={[styles.messageBubble, styles.myBubble]}>
              <Text style={styles.messageText}>Preview:</Text>
              <Image
                source={{ uri: pendingImage }}
                style={{ width: 200, height: 200, borderRadius: 12, marginTop: 5 }}
              />
            </View>
          )}

          {messages.length > 0 &&
            messages[messages.length - 1]?.from === "bot" &&
            !isLoading && (
              <View style={styles.quickRepliesContainer}>
                {messages[messages.length - 1].quick_replies?.map((reply, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickReplyButton}
                    onPress={() => handleQuickReply(reply)}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {isLoading && (
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="small" color={colors.primary || "#1D3557"} />
              <Text style={styles.loadingText}>Lino is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// StyleSheet for component styling
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background || "#F5F5F5",
    paddingTop: Platform.OS === "android" ? 30 : 0, // Adjust for Android status bar
  },
  flex: {
    flex: 1,
  },
  header: {
    width: "100%",
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, // Thin border
    borderBottomColor: "#ccc",
    paddingHorizontal: 15,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  backButton: {
    padding: 5, // Provides a larger touch area
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.header || "#1D3557",
    textAlign: "center",
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messagesContentContainer: {
    paddingBottom: 20, // Adds space at the bottom of the scrollable content
  },
  messageBubble: {
    maxWidth: "78%", // Max width for message bubbles
    padding: 12,
    marginVertical: 5,
    borderRadius: 18, // Rounded corners for message bubbles
    elevation: 1, // Subtle Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myBubble: {
    backgroundColor: colors.primary || "#1D3557",
    alignSelf: "flex-end", // Align user's messages to the right
  },
  botBubble: {
    backgroundColor: colors.botBubble || "#E0E0E0",
    alignSelf: "flex-start", // Align bot's messages to the left
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#fff", // White text for user's messages
  },
  botMessageText: {
    color: "#333", // Dark text for bot's messages
  },
  quickRepliesContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow buttons to wrap to the next line
    marginVertical: 10,
    alignSelf: "flex-start", // Align quick replies with bot messages
  },
  quickReplyButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.secondary || "#457B9D", // Secondary color for quick replies
    borderRadius: 25, // Pill shape buttons
    margin: 6,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  quickReplyText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.botBubble || "#E0E0E0",
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    alignItems: 'center',
    maxWidth: '50%', // Limit width of typing indicator
  },
  loadingText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 48, // Minimum height for single-line input
    maxHeight: 120, // Maximum height to allow multi-line input up to a certain point
    backgroundColor: "#f1f1f1",
    borderRadius: 25, // Rounded input field
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#333",
    paddingVertical: Platform.OS === "ios" ? 15 : 10, // Adjust vertical padding for text input
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary || "#1D3557",
    borderRadius: 24, // Perfect circle for the send button
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ChatbotScreen;