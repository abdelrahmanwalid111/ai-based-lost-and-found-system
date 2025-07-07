// App.js - Using expo-router for consistent navigation
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ExpoRoot } from 'expo-router';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <ExpoRoot />
    </>
  );
}