import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserIdState] = useState(null);

  const setUserId = async (id) => {
    setUserIdState(id);
    await AsyncStorage.setItem("userId", id); // persist to storage
  };

  const loadUserId = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    if (storedId) setUserIdState(storedId);
  };

  useEffect(() => {
    loadUserId(); // load from storage on startup
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
