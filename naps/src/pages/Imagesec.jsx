// import React from 'react'
import { useState, useEffect } from "react";
// import image1 from "../assets/Home/image1.jpeg";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.jpg";
import "../css/image.css";

const Imagesec = () => {
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
    <div className="slider-container">
      <div className="slider">
        {slides.map((slide, index) => (
          <div
            className={`slide ${index === slideIndex ? "active" : ""}`}
            key={index}
          >
            <img className="imgslider" src={slide} alt={`Slide ${index + 1}`} />
            <div className="text">
              <div
                className="imgsec"
                style={{
                  backgroundColor: "rgba(40, 38, 38, 0.5)",
                  //   padding: "20px",
                  //   borderRadius: "10px",
                  //   color: "#fff",
                  width: "100%",
                  height: "100%",
                  margin: "0 auto",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span className="span">NAPSCON 2025</span>
                <h1 className="homehead">
                  2nd International Conference of Nepalese Association of
                  Paediatric surgeons
                </h1>
                <p className="slider-address">
                  {" "}
                  <span>Hotel Himalaya</span>
                  <br /> Kupondol Height, Lalitpur, Nepal <br />
                  10th - 11th April, 2025
                </p>

                <p className="sub-title">
                  {/* We invite you to be a part of an enlightening experience at the Nepalese Association of Pediatric Surgeons' upcoming conference. This event brings together a community of expert speakers, renowned pediatric surgeons, and healthcare professionals from around the world.  */}
                </p>
                {/* <p className="sub-title">
    Don’t miss out on this unique chance to expand your expertise, exchange ideas, and be part of a transformative experience in pediatric surgery. Early bird registration is open, and we look forward to seeing you at this prestigious event. 
    </p> */}
              </div>
            </div>
          </div>
          //   </div>
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
  );
};

export default Imagesec;
