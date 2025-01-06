import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
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
          <Link to="/" className="mr-5 hover:text-third">
            Home
          </Link>

          <Link to="/about-us" className="mr-5 hover:text-third">
            About Us
          </Link>

          <Link to="/team" className="mr-5 hover:text-third">
            Our Team
          </Link>

          <Link to="/contact-us" className="mr-5 hover:text-third">
            Contact Us
          </Link>

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
