import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useState } from "react";
import "../css/Header.css";
import "../css/register-about.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // For programmatic navigation

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNavigateAndClose = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="wrapper">
      <header className="header" id="header">
        <div className="container nav-container">
          <div className="logo">
            <img src={logo} alt="logo" />
            <span className="webname">
              Nepalese Association of Pediatric Surgeons
            </span>
          </div>
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>
        </div>
        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          {/* Navigate to the Home Page */}
          <button onClick={() => handleNavigateAndClose("/")}>Home</button>

          {/* Navigate to the About Us Page */}
          <button onClick={() => handleNavigateAndClose("/about-us")}>
            About
          </button>

          {/* Navigate to the About Us Page */}
          <button onClick={() => handleNavigateAndClose("/team")}>
            Our-Team
          </button>
          {/* Navigate to the About Us Page */}
          <button onClick={() => handleNavigateAndClose("/contact-us")}>
            Contact Us
          </button>

          {/* Navigate to the Register Page */}
          <button>
            <Link to="/register" onClick={toggleMenu}>
              Register
            </Link>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default Header;
