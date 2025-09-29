import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import PictogramsScreen from './pages/PictogramsScreen';
import InternalGalleryScreen from './pages/InternalGalleryScreen';
import LoginScreen from './pages/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';


function RootNavigator(): React.JSX.Element {
  const { token } = useAuth();

  return (
    <Routes>
      {!token ? (
        <>
          {/* se não tem token, tanto / quanto /login abrem o LoginScreen */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginScreen />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/pictograms/:folderName" element={<PictogramsScreen />} />
          <Route path="/internal-gallery" element={<InternalGalleryScreen />} />
        </>
      )}
      {/* fallback para qualquer outra rota */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
    </Routes>
  );
}



export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Router>
        <RootNavigator />
      </Router>
    </AuthProvider>
  );
}
