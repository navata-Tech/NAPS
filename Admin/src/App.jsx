import React, { useEffect, useState } from "react";
import './App.css';
import AdminLogin from './Pages/Login';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminDashboard from './Pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoutes';
import { isAdminAuthenticated, logoutAdmin } from './utility/IsAuthenticated';
import Sidebar from './components/Sidebar';  // Import Sidebar component
import ViewRegistration from './components/ViewRegistration';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());

  useEffect(() => {
    const isLoggedIn = isAdminAuthenticated();
    setIsAuthenticated(isLoggedIn);

    if (!isLoggedIn && location.pathname !== "/login") {
      navigate("/login");
    }

    const checkTokenExpiration = () => {
      const expiration = localStorage.getItem("expiration");
      if (expiration && Date.now() > expiration) {
        logoutAdmin();
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(intervalId);
  }, [location, navigate]);

  const hideSidebar = location.pathname === "/login";

  return (
    <>
      {!hideSidebar && isAuthenticated && (
        <div className="app-container d-flex">
          <Sidebar />  {/* Use Sidebar component */}
          <main className="content-container">
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<Navigate to="/AdminDashboard" />} />
                {/* Add trailing /* to handle nested routes */}
                <Route
                  path="/AdminDashboard/*"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  }
                />
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
            element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
          />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
