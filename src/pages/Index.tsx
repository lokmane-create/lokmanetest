"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard'); // Redirect to the dashboard
  }, [navigate]);

  return null; // This page will just redirect
};

export default Index;