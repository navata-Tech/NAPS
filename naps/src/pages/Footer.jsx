import logo from "../assets/logo.png";
const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content container">
        <div className="footer-section footer-description about">
          <div className="logo">
            <img src={logo} alt="NAPS Logo" />
          </div>
          <div>
            <h5 className="footer-title">NAPS</h5>
            <p>
              We are established to develop paediatric surgery and its
              specialties in Nepal.
            </p>
            <p className="location">
              Kanti Children’s Hospital, Maharajgunj, Kathmandu
            </p>
          </div>
        </div>
        <div className="footer-section quick-links">
          <h5 className="footer-title">Quick Links</h5>
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Our Team</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </div>
        <div className="footer-section contact">
          <div className="contact-block">
            <h5 className="footer-title">Contact Us</h5>
            <p>
              Email:{" "}
              <a href="mailto:pedsurg.nepal@gmail.com">
                pedsurg.nepal@gmail.com
              </a>
            </p>
            <p>
              Phone: <a href="tel:01-4411550">01-4411550</a>
            </p>
          </div>

          <h5 className="footer-title social-title">
            Join Our Social Community
          </h5>
          <div className="social-icons">
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
