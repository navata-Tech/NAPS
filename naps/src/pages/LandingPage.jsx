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
            standard surgical care to infants, children and adolescents. It is a
            branch of medicine, which deals with diagnosis and performance of
            surgical procedures on children’s bodies, their malformations,
            physical injuries and more complex diseases.
            <br />
            We aim for every single child in Nepal, especially the ones that are
            located in the most remote and isolated places that are difficult to
            access, to receive the best relevant surgical treatment. Our
            association comprises a group of pediatric surgeons and scientists
            who contribute towards the improvement of the quality of pediatric
            surgical services by means of teaching, new methods and teamwork.
            There is a proper focus on the young patients’ both physical and
            psychosocial well-being by establishing a family-based, inclusive
            model of service delivery and offering more than just intervention,
            care that facilitates their healing and development.
            <br />
            We are continuously eager to improve the status of child surgery in
            Nepal with the help of international cooperation.
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
