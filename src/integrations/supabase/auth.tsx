"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        navigate('/login');
      } else if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        // Fetch user profile to get the role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          showError('Failed to load user profile.');
          // Even if profile fetch fails, we still set the user, but role might be missing
        } else if (profile) {
          // Attach role to user object for easier access
          currentSession.user.user_metadata.role = profile.role;
          setUser(currentSession.user);
        }
        
        if (location.pathname === '/login') {
          navigate('/'); // Redirect to home if already logged in and on login page
        }
      }
      setLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        // Fetch user profile for initial load
        supabase
          .from('profiles')
          .select('role')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Error fetching initial user profile:', error);
              showError('Failed to load initial user profile.');
            } else if (profile) {
              initialSession.user.user_metadata.role = profile.role;
              setUser(initialSession.user);
            }
          });
        if (location.pathname === '/login') {
          navigate('/');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to sign out.');
      console.error('Error signing out:', error);
    } else {
      setSession(null);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SessionContextProvider');
  }
  return context;
};