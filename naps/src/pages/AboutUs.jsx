
import presidentImage from "../assets/presidentimg.jpg";

const AboutUs = () => {
  return (
    <>
      <div className="header-title">
        <div className="overlay">
          <h1>About Us</h1>
          <p className="sub-title">
            Our main aim is to develop pediatric surgery and its specialties in
            Nepal, to promote surgical care for the neonatal and pediatric
            population across the country, and to support and organize various
            events, research, collaborations, and training in pediatric surgery.
          </p>
        </div>
      </div>
      <div className="section aboutus">
        <div className="card-block">
          <div className="aboutus-card">
            <i
              className="fa-solid fa-circle-check"
              style={{ color: "#a01f62", fontSize: "36px" }}
            ></i>
            <span className="card-txt">
              Develop pediatric surgery and its specialties in Nepal.
            </span>
          </div>
          <div className="aboutus-card">
            <i
              className="fa-solid fa-circle-check"
              style={{ color: "#a01f62", fontSize: "36px" }}
            ></i>
            <span className="card-txt">
              Promote accessible surgical care for neonatal and pediatric
              populations across the country.
            </span>
          </div>
          <div className="aboutus-card">
            <i
              className="fa-solid fa-circle-check"
              style={{ color: "#a01f62", fontSize: "36px" }}
            ></i>
            <span className="card-txt">
              Support and organize various events, research initiatives, and
              collaborations in pediatric surgery.
            </span>
          </div>
          <div className="aboutus-card">
            <i
              className="fa-solid fa-circle-check"
              style={{ color: "#a01f62", fontSize: "36px" }}
            ></i>
            <span className="card-txt">
              Provide training and education to enhance expertise in pediatric
              surgery.
            </span>
          </div>
        </div>
      </div>
      <section className="president-section p-section">
        <div className="president-text">
            <h3>Letter From The President</h3>
            <p>President&apos;s Message</p>
            <p>Namaskar,</p>
            <p>
                Greeting from Nepalese Association of Pediatric Surgeons. It’s our great privilege to announce that we are organizing the first International Conference of Pediatric Surgeons in Kathmandu on 10-11th April 2025.
            </p>
            <p>
                The Association remains committed towards the development of Paediatric and adolescent Surgery in Nepal with such focused programs enabling better collaboration and in providing improved paediatric surgical service. We are planning various events coming year with an objective to update and share knowledge which helps overall Pediatric surgical development. 
            </p>
            <p>
                Details of these events can be found on our website and our social media channels. We take this opportunity to thank all our members contributing towards innovative and ongoing activities in numerous avenues for the Association.
            </p>
            <p>With best wishes,<br />
            Prof Dr Rameshwar Prasad Pokharel
            </p>
        </div>
        <div className="president-image">
            <img src={presidentImage} alt="President Image"></img>
        </div>
    </section>
    </>
  );
};

export default AboutUs;
