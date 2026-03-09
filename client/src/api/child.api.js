import api from './axios';

export const createChild  = (data)  => api.post('/api/children', data);
export const getChildren  = ()      => api.get('/api/children');
export const getChild     = (id)    => api.get(`/api/children/${id}`);
export const updateChild  = (id, d) => api.put(`/api/children/${id}`, d);
export const deleteChild  = (id)    => api.delete(`/api/children/${id}`);
