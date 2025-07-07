import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons"; // Use Expo icons
import styled from "styled-components/native";
import { useRouter } from "expo-router";

const PasswordUpdatedScreen = () => {
  const router = useRouter();

  const handleLoginPress = () => {
    console.log('Login button pressed');
    try {
      // Use expo-router to navigate to Login
      router.replace('/Login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Container>
      <BackgroundOverlay />
      <CheckmarkContainer style={styles.shadow}>
        <Feather name="check" size={50} color="#1D3557" />
      </CheckmarkContainer>

      <Message>Your password has been updated successfully.{"\n"}Return to login.</Message>

      <LoginButton style={styles.shadow} onPress={handleLoginPress}>
        <LoginButtonText>Login</LoginButtonText>
      </LoginButton>
    </Container>
  );
};

export default PasswordUpdatedScreen;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
`;

const BackgroundOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  border-top-left-radius: 40px;
  border-bottom-right-radius: 40px;
  opacity: 0.5;
`;

const CheckmarkContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: white;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Message = styled.Text`
  font-size: 18px;
  text-align: center;
  color: #333;
  font-weight: 500;
  margin-bottom: 20px;
`;

const LoginButton = styled(TouchableOpacity)`
  background-color: #1d3557;
  padding: 14px 30px;
  border-radius: 10px;
  min-width: 200px;
  align-items: center;
`;

const LoginButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
