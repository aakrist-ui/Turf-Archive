import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5001/api', //  for iOS simulator
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
