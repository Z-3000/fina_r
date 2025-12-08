import React, { createContext, useContext } from 'react';

// App Context - 전역 상태 공유
const AppContext = createContext(null);

// Context Provider (App.jsx에서 사용)
export const AppProvider = ({ children, value }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Context Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
