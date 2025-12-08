'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './use-auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface AdminContextType {
  isAdmin: boolean;
  enableAdminMode: () => void;
  disableAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  const enableAdminMode = () => setIsAdmin(true);
  const disableAdminMode = () => setIsAdmin(false);

  const value = { isAdmin, enableAdminMode, disableAdminMode };

  return (
    <AdminContext.Provider value={value}>
        {children}
    </AdminContext.Provider>
  );
};

// This component will be a child of both AdminProvider and AuthProvider,
// so it can safely use both hooks.
export function AdminAuthObserver() {
    const { user, isUserLoading } = useAuth();
    const { enableAdminMode, disableAdminMode, isAdmin } = useAdmin();

    useEffect(() => {
        const isRootUser = user?.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2';
        
        // If the auth state is done loading and there is no user,
        // ensure admin mode is disabled. This is a critical security
        // check to reset state upon logout.
        if (!isUserLoading && !user) {
            if (isAdmin) disableAdminMode();
        } else if (isRootUser) {
            if (!isAdmin) enableAdminMode();
        }
    }, [user, isUserLoading, enableAdminMode, disableAdminMode, isAdmin]);
    
    // Also render the error listener here, as it needs to be inside the providers
    return <FirebaseErrorListener />;
}


export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
