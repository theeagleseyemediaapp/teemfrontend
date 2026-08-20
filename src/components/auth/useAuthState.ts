import { useEffect, useState } from "react";
import { useAuthMe, useSignOut } from "../../lib/api";
import { getStoredUser, setStoredUser, getToken, isTokenExpired, clearSession } from "../../lib/auth-session";

export function useAuthState() {
  const auth = useAuthMe();
  const signOut = useSignOut();
  const [storedUser, setStoredUserState] = useState(() => getStoredUser());

  useEffect(() => {
    if (isTokenExpired()) {
      clearSession();
      setStoredUserState(null);
    }
  }, []);

  const user = auth.data?.user ?? storedUser;
  const isLoading = auth.isLoading && storedUser === null && !getToken();

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSettled: () => {
        setStoredUserState(null);
        window.location.reload();
      },
    });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!getToken() && !isTokenExpired(),
    signOut: handleSignOut,
  };
}
