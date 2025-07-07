// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import WelcomeScreen from '../app/index';
import LoginScreen from '../app/LoginScreen';
import SignupScreen from '../app/Signup'; 
import ForgotPasswordScreen from '../app/Forget_Password';    
import TabsNavigator from './TabsNavigator';
import SettingsScreen from '../app/tabs/setting';
import ProfileScreen from '../app/profile';
import ManageReportsScreen from '../app/manage';
import AboutScreen from '../app/settings/about';
import PoliciesScreen from '../app/settings/policies';
import TermsAndConditions from '../app/settings/terms';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth flow */}
        <Stack.Screen name="welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Main app after login */}
        <Stack.Screen name="tabs" component={TabsNavigator} />

        {/* Settings & Profile */}
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="profile" component={ProfileScreen} />
        <Stack.Screen name="manage" component={ManageReportsScreen} />
        <Stack.Screen name="about" component={AboutScreen} />
        <Stack.Screen name="policies" component={PoliciesScreen} />
        <Stack.Screen name="terms" component={TermsAndConditions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
