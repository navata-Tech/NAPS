import logo from "../assets/logo.png";
const Header = () => {
  return (
    <>
      <div className="wrapper">
        <header className="header" id="header">
          {" "}
          <div className="container nav-container">
            <div className="logo">
              <img src={logo} alt="logo" />{" "}
              <span>Nepalese Association of Pediatric Surgeons</span>
            </div>
          </div>
         <nav>
        <a href="/">Home</a>
        <a href="#">Our Team</a>
        <a href="#">Blog</a>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
        <button>
          <a href="#">Register</a>
        </button>
      </nav>

        </header>
      </div>
    </>
  );
};

export default Header;
