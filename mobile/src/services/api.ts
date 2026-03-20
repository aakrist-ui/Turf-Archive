import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_PORT = 5000;

const api = axios.create({
  baseURL: `http://${API_HOST}:${API_PORT}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
