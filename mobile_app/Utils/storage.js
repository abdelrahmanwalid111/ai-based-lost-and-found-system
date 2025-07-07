import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserId = async (id) => {
  await AsyncStorage.setItem('userId', id);
};

export const getUserId = async () => {
  return await AsyncStorage.getItem('userId');
};

export const clearUserId = async () => {
  await AsyncStorage.removeItem('userId');
};
