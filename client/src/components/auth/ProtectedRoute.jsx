import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) return null;
  return token ? children : <Navigate to="/login" replace />;
}
