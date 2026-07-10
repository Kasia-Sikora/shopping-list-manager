import { BASE_URL } from '../consts';
import type { List } from '../interfaces';
import { fetchApi, HttpError } from './apiClient';

export const apiService = {
  async getAllLists(): Promise<List[]> {
    return await fetchApi(`${BASE_URL}/lists`);
  },

  async createList(list: List): Promise<List> {
    return await fetchApi(`${BASE_URL}/lists`, { method: 'POST', body: JSON.stringify(list) });
  },

  async updateList(id: string, data: List): Promise<List> {
    return await fetchApi(`${BASE_URL}/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  async deleteList(id: string): Promise<{ id: string }> {
    try {
      return await fetchApi(`${BASE_URL}/lists/${id}`, { method: 'DELETE' });
    } catch (error) {
      if (error instanceof HttpError && (error.status === 404 || error.status === 410)) {
        return { id };
      }
      throw error;
    }
  },
};
