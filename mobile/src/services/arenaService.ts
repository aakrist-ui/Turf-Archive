import { Arena } from '../components/ArenaCard';
import api from './api';

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
