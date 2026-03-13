import React, { createContext, useContext, useState } from 'react';

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleDemoMode = () => setIsDemoMode(!isDemoMode);

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoContext);
