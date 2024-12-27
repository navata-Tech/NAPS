import { useEffect, useState } from "react";
import image1 from "../assets/image1.jpg"; // Replace with your actual image paths
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.jpg";
import Header from "./Header";
import Footer from "./Footer";

const LandingPage = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [image1, image2, image3]; // Array of images

  // Function to show the next slide
  const showNextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  // Function to show the previous slide
  const showPrevSlide = () => {
    setSlideIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  // Auto-play slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(showNextSlide, 5000); // 5000ms = 5s
    return () => clearInterval(interval); // Clear interval when component unmounts
  }, [showNextSlide]);

  return (
    <>
    <Header/>
      <div>
        <div className="slider-container">
          <div className="slider">
            {slides.map((slide, index) => (
              <div
                className={`slide ${index === slideIndex ? "active" : ""}`}
                key={index}
              >
                <img src={slide} alt={`Slide ${index + 1}`} />
                <div className="text">
                  <h1>Registration</h1>
                  <p className="sub-title">
                    Please enter your details to register for the conference.
                    Please note that registration is mandatory for approval of
                    the submitted abstract and also for participation in the
                    conference. Early bird registration closes on 21st
                    September, 2024.
                  </p>
                  <p className="sub-title">
                    (Please book your hotels and flight tickets early as
                    November is a peak tourist season in Pokhara. For details
                    please contact our travel desk.)
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Next/Prev controls */}
          <button className="prev" onClick={showPrevSlide}>
            &#10094;
          </button>
          <button className="next" onClick={showNextSlide}>
            &#10095;
          </button>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default LandingPage;
