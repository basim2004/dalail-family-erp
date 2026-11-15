'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Member } from '../types';
import { db } from '../db/dbService';
import { auth } from '../db/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  currentMember: Member | null;
  login: (identifier: string, role?: UserRole) => User | null;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  currentMember: null,
  login: () => null,
  logout: () => {},
  switchRole: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('dalail_v2_auth_id');
      if (storedUserId) {
        if (storedUserId === 'logged_out') {
          setUser(null);
          setIsLoading(false);
          return;
        }
        const found = db.getUserById(storedUserId);
        if (found) {
          setUser(found);
          setIsLoading(false);
          return;
        }
      }
      // Default to Main Admin if none set
      const defaultAdmin = db.getUsers().find((u) => u.role === 'main_admin');
      if (defaultAdmin) {
        setUser(defaultAdmin);
        localStorage.setItem('dalail_v2_auth_id', defaultAdmin.id);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (identifier: string, targetRole?: UserRole): User | null => {
    const users = db.getUsers();
    let found = users.find(
      (u) =>
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.phone === identifier ||
        u.id === identifier
    );

    // If not in users list, check if identifier is a member's student username, memberId, mobile, or name
    if (!found) {
      const members = db.getMembers();
      const member = members.find(
        (m) =>
          m.studentUsername?.toLowerCase() === identifier.toLowerCase() ||
          m.name.toLowerCase() === identifier.toLowerCase() ||
          m.memberId.toLowerCase() === identifier.toLowerCase() ||
          (m.phone && m.phone === identifier)
      );

      if (member) {
        const studentUser: User = {
          id: `user_student_${member.id}`,
          name: member.name,
          username: member.studentUsername || member.name.toLowerCase().replace(/\s+/g, ''),
          email: `${member.name.toLowerCase().replace(/\s+/g, '')}@dalail.org`,
          phone: member.phone || '+91 9633915864',
          role: 'student',
          campusId: member.campusId,
          campusName: member.campusName,
          memberId: member.id,
          active: true,
          createdAt: member.createdAt,
        };
        setUser(studentUser);
        localStorage.setItem('dalail_v2_auth_id', studentUser.id);
        return studentUser;
      }
    }

    if (!found && targetRole) {
      found = users.find((u) => u.role === targetRole);
    }

    if (found) {
      setUser(found);
      localStorage.setItem('dalail_v2_auth_id', found.id);
      return found;
    }
    return null;
  };

  const switchRole = (newRole: UserRole) => {
    const users = db.getUsers();
    const target = users.find((u) => u.role === newRole);
    if (target) {
      setUser(target);
      localStorage.setItem('dalail_v2_auth_id', target.id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.setItem('dalail_v2_auth_id', 'logged_out');
    try {
      signOut(auth).catch(() => {});
    } catch {
      // Ignore if auth offline
    }
  };

  const currentMember = user?.memberId ? db.getMemberById(user.memberId) || null : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        currentMember,
        login,
        logout,
        switchRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
