import img from "../assets/landing-img.jpg";
import Imagesec from "./Imagesec";
import TeamPage from "./TeamPage"; // Import TeamPage
import ContactUsPage from "./ContactUsPage"; // Import ContactUsPage
import "../css/Kritka.css";

const LandingPage = () => {
  return (
    <>
      <Imagesec />
      <div className="content-img-holder">
        <div className="content-holder">
          <h3>Transforming Pediatric Healthcare in Nepal</h3>
          <p>
            The Nepalese Association of Pediatric Surgeons is focused on
            “Advancing Child Surgery in the Himalayas” by providing high
            standard surgical care to infants, children, and adolescents.
          </p>
        </div>
        <div className="img-holder">
          <img src={img} alt="" />
        </div>
      </div>

      {/* Team Section */}
      <TeamPage />

      {/* Contact Us Section */}
      <ContactUsPage />
    </>
  );
};

export default LandingPage;
