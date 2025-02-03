import { useState } from "react";
import "../css/Kritka.css";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationClass, setConfirmationClass] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if all fields are filled
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.message
    ) {
      setConfirmationMessage("Please fill out all fields.");
      setConfirmationClass("alert-message");
      setTimeout(() => {
        setConfirmationMessage("");
      }, 5000); // Remove message after 5 seconds
      return; // Stop further execution if validation fails
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVERAPI}/enquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setConfirmationMessage(result.message);
        setConfirmationClass("success-message"); // Success message
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
        });

        setTimeout(() => {
          setConfirmationMessage("");
        }, 5000); // Remove message after 5 seconds
      } else {
        setConfirmationMessage("There was an error submitting your enquiry.");
        setConfirmationClass("alert-message"); // Error message

        setTimeout(() => {
          setConfirmationMessage("");
        }, 5000); // Remove message after 5 seconds
      }
    } catch (error) {
      setConfirmationMessage("An error occurred. Please try again later.");
      setConfirmationClass("alert-message"); // Error message

      setTimeout(() => {
        setConfirmationMessage("");
      }, 5000); // Remove message after 5 seconds
    }
  };
  return (
    <>
      <div className="contact-to">
        <div className="contact-to-details">
          <span>Prof. Dr. Rameshwar Prasad Pokharel</span>
          <span>
            <a href="tel:+9779851029644">
              <i className="fa-solid fa-phone" style={{ color: "#a01f62" }}></i>
              9851064927
            </a>
          </span>
        </div>
        <div className="contact-to-details">
          <span>Prof. Dr. Bijay Thapa</span>
          <span>
            <a href="tel:+9779851029644">
              <i className="fa-solid fa-phone" style={{ color: "#a01f62" }}></i>
              9851029644
            </a>
          </span>
        </div>
        <div className="contact-to-details">
          <span>Dr Shirish Silwal</span>
          <span>
            <a href="tel:+9779843957755">
              <i className="fa-solid fa-phone" style={{ color: "#a01f62" }}></i>
              9843957755
            </a>
          </span>
        </div>
        <div className="contact-to-details">
          <span>Dr Dinesh Prasad Koirala</span>
          <span>
            <a href="tel:+9779702999999">
              <i className="fa-solid fa-phone" style={{ color: "#a01f62" }}></i>
              9702999999
            </a>
          </span>
        </div>
      </div>
      <div className="enquiry-form-section">
        <div className="enquiry-form">
          <div className="form-heading">
            <h3>Enquiry Form</h3>
          </div>
          <div className="contact-form-input">
            <input
              className="contact-box-field"
              placeholder="Name *"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              className="contact-box-field"
              placeholder="Phone *"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <input
              className="contact-box-field"
              placeholder="E-mail *"
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <textarea
              className="abstract-section"
              placeholder="Message *"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <button
            className="primary-button"
            type="submit"
            onClick={handleSubmit}
          >
            Send
          </button>

          {confirmationMessage && (
            <div className={confirmationClass}>
              <p>{confirmationMessage}</p>
            </div>
          )}
        </div>
        <div className="map-holder">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.436279523537!2d85.3258971740543!3d27.73468642428775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb193c042a6e29%3A0x64f289c5109f3317!2sKanti%20Children&#39;s%20Hospital!5e0!3m2!1sen!2snp!4v1734951486133!5m2!1sen!2snp"
            width="100%"
            height="400"
            frameBorder="0"
            allowFullScreen
            title="Google Maps"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
