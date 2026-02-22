import axios from 'axios';
import { Arena } from '../components/ArenaCard';


const BASE_URL = 'http://10.0.2.2:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const arenaService = {

  getAllArenas: async (): Promise<Arena[]> => {
    const response = await api.get('/arenas');
    return response.data;
  },


  getArenaById: async (id: string): Promise<Arena> => {
    const response = await api.get(`/arenas/${id}`);
    return response.data;
  },
};