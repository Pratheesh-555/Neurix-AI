import api from './axios';

export const submitScreening      = (data)    => api.post('/api/screening', data);
export const getScreeningHistory  = (childId) => api.get(`/api/screening/child/${childId}`);
export const getScreening         = (id)      => api.get(`/api/screening/${id}`);
