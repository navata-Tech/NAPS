import React, { useEffect, useState } from "react";
import './App.css';
import LogOut from "./Pages/LogOut";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import AdminProtectedRoute from './components/AdminProtectedRoutes';
import { isAdminAuthenticated, logoutAdmin } from './utility/auth';
import Sidebar from './components/Sidebar'; 
import ViewRegistration from './components/ViewRegistration';
import LogIn from './Pages/LogIn';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());

  useEffect(() => {
    const isLoggedIn = isAdminAuthenticated();
    setIsAuthenticated(isLoggedIn);
  
    if (!isLoggedIn && location.pathname !== "/login") {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    }
  
    const checkTokenExpiration = () => {
      const expiration = localStorage.getItem("expiration");
      if (expiration && Date.now() > expiration) {
        logoutAdmin(); 
        setIsAuthenticated(false);
        window.location.href = "/login"; 
      }
    };
  
    const intervalId = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(intervalId);
  }, [location]);

  const hideSidebar = location.pathname === "/login";

  return (
    <>
      {!hideSidebar && isAuthenticated && (
        <div className="app-container d-flex">
          <Sidebar /> 
          <main className="content-container">
            <div className="container mt-4">
              <Routes>
                <Route
                  path="/View-Registration"
                  element={
                    <AdminProtectedRoute>
                      <ViewRegistration />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="/logout" element={<LogOut />} />
              </Routes>
            </div>
          </main>
        </div>
      )}

      {(!isAuthenticated || hideSidebar) && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<LogIn setIsAuthenticated={setIsAuthenticated} />}
          />
        </Routes>
      )}
    </>
  );
}

export default App;
