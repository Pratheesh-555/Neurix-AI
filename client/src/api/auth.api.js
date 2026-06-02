import api from './axios';

export const register       = (data)            => api.post('/api/auth/register', data);
export const login          = (data)            => api.post('/api/auth/login', data);
export const googleSignIn   = (idToken)         => api.post('/api/auth/google', { idToken });
export const completeProfile = (data, tempToken) =>
  api.post('/api/auth/complete-profile', data, {
    headers: { Authorization: `Bearer ${tempToken}` },
  });
export const getMe          = ()                => api.get('/api/auth/me');
export const updateVoice    = (texts)           => api.put('/api/auth/update-voice', { approvedTexts: texts });
