import React from 'react';
import GuestNavbar from './GuestNavbar';
import UserNavbar from './UserNavbar';
import { useAuth } from '../context/AuthContext';

const SmartNavbar = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Wait for auth check

  return user ? <UserNavbar /> : <GuestNavbar />;
};

export default SmartNavbar;
