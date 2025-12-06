'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
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
        <FirebaseErrorListener />
        {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
