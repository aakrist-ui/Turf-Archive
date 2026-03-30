import React from 'react';
import { AuthProvider } from './src/context/AuthContext.tsx';
import { ChatProvider } from './src/context/ChatContext.tsx';
import { NotificationProvider } from './src/context/NotificationContext.tsx';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
