import React, { useState } from "react";
import { NavLink } from "react-router-dom";
// import "../Style/Slidebar.css";  // Ensure Sidebar styling is applied

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button className="menu-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h5 className="text-white">Admin Dashboard</h5>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              to="/AdminDashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Admin Dashboard
            </NavLink>
          </li>
         
          <li className="nav-item">
            <NavLink
              to="/View-Registration"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              View Registration
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
