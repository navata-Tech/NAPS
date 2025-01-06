import img1 from "../assets/img1.jpeg";
import img2 from "../assets/img2.jpeg";
import img3 from "../assets/img3.jpeg";
import img4 from "../assets/img4.jpeg";
import img5 from "../assets/img5.jpeg";
import img6 from "../assets/img6.jpeg";
import img7 from "../assets/img7.jpeg";
import img8 from "../assets/img8.jpeg";
import img9 from "../assets/img9.jpeg";
import img10 from "../assets/img10.jpeg";
import img11 from "../assets/img11.jpeg";
import "../css/Kritka.css";

const TeamPage = () => {
  return (
    <div className="team-section">
      <div className="our-team">
        <div className="team-heading">
          <h3>Meet Our Teams</h3>
          <p>
            Meet the experts of the Nepalese Association of Pediatric
            Surgeons, committed to advancing pediatric healthcare with skill
            and dedication.
          </p>
        </div>
        <div className="team">
          <div className="team-container">
            <div className="member">
              <div className="member-name">
                <img src={img1} alt="Sienna Hewitt" />
                <h3>Prof. Dr. Rameshwar Prasad Pokharel</h3>
              </div>
              <p>President</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img2} alt="Ashwin Santiago" />
                <h3>Prof. Dr. Ramnandan Chaudhary</h3>
              </div>
              <p>Immediate Past President</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img3} alt="Caitlyn King" />
                <h3>Prof. Dr. Anupama Thapa</h3>
              </div>
              <p>Vice President</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img4} alt="Owen Garcia" />
                <h3>Prof. Dr. Bijay Thapa</h3>
              </div>
              <p>General Secretary</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img5} alt="Sienna Hewitt" />
                <h3>Dr. Ramana Rajkarnikar</h3>
              </div>
              <p>Secretary</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img6} alt="Ashwin Santiago" />
                <h3>Dr. Dinesh Prasad Koirala</h3>
              </div>
              <p>Treasurer</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img7} alt="Caitlyn King" />
                <h3>Dr. Jasmine Bajracharya</h3>
              </div>
              <p>Joint Treasurer</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img8} alt="Owen Garcia" />
                <h3>Dr. Puskar Pokharel</h3>
              </div>
              <p>Member</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img9} alt="Ashwin Santiago" />
                <h3>Dr Suman Bikram Adhikari</h3>
              </div>
              <p>Member</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img10} alt="Caitlyn King" />
                <h3>Dr.Nripesh Rajbhandari</h3>
              </div>
              <p>Member</p>
            </div>

            <div className="member">
              <div className="member-name">
                <img src={img11} alt="Owen Garcia" />
                <h3>Dr. Shirish Silwal</h3>
              </div>
              <p>Member</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
