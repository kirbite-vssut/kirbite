import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kirbite_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('student'); // 'student' | 'vendor'

  useEffect(() => {
    if (user) {
      localStorage.setItem('kirbite_user', JSON.stringify(user));
      if (user.role === 'student') {
        localStorage.setItem('kfc_student_name', user.name || '');
        localStorage.setItem('kfc_student_phone', user.phone || '');
        localStorage.setItem('kfc_hostel_block', user.hostelBlock || '');
        localStorage.setItem('kfc_room_number', user.room || '');
      }
    } else {
      localStorage.removeItem('kirbite_user');
    }
  }, [user]);

  const loginStudent = ({ name, phone, hostelBlock, room }) => {
    const studentUser = {
      role: 'student',
      name: name.trim(),
      phone: phone.trim(),
      hostelBlock: hostelBlock || 'CV Raman Hall',
      room: room.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'student')}`,
      loggedAt: new Date().toISOString(),
    };
    setUser(studentUser);
    setIsAuthModalOpen(false);
    return studentUser;
  };

  const loginVendor = ({ stallId, stallName, ownerPin }) => {
    const vendorUser = {
      role: 'vendor',
      stallId,
      stallName,
      ownerPin,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(stallName || 'stall')}`,
      loggedAt: new Date().toISOString(),
    };
    setUser(vendorUser);
    setIsAuthModalOpen(false);
    return vendorUser;
  };

  const loginAdmin = ({ username, password }) => {
    if (
      (username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'kirbite_admin') &&
      (password === 'admin123' || password === 'kirbite@2026' || password === 'admin')
    ) {
      const adminUser = {
        role: 'admin',
        username: username.trim(),
        name: 'Master Campus Admin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kirbite_admin',
        loggedAt: new Date().toISOString(),
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, message: 'Invalid admin username or password' };
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = (tab = 'student') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        loginStudent,
        loginVendor,
        loginAdmin,
        logout,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
