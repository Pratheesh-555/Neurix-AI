import api from './axios';

// Programs
export const generateProgram    = (childId)     => api.post('/api/programs/generate', { childId });
export const getProgramStatus   = (jobId)        => api.get(`/api/programs/status/${jobId}`);
export const getProgram         = (id)           => api.get(`/api/programs/${id}`);
export const getProgramHistory  = (childId)      => api.get(`/api/programs/child/${childId}`);
export const approveProgram     = (id)           => api.post(`/api/programs/${id}/approve`);

// Sessions
export const startSession       = (programId)      => api.post('/api/sessions', { programId });
export const logActivity        = (id, data)       => api.post(`/api/sessions/${id}/log`, data);
export const triggerPivot       = (id, activityId) => api.post(`/api/sessions/${id}/pivot`, { activityId });
export const getSessionSummary  = (id)             => api.get(`/api/sessions/${id}/summary`);
export const getSessions        = (childId)        => api.get('/api/sessions', { params: childId ? { childId } : {} });

// Analytics
export const getAnalyticsOverview    = ()  => api.get('/api/analytics/overview');
export const getAnalyticsOutcomes    = ()  => api.get('/api/analytics/outcomes');
export const getAnalyticsShapSummary = ()  => api.get('/api/analytics/shap-summary');
