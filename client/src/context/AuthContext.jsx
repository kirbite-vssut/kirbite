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
