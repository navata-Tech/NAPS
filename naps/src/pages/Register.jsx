import React, { useState } from "react"; // Add this import
import Header from "./Header";
import Footer from "./Footer";

const Register = () => {
  const [formData, setFormData] = useState({
    category: "",
    salutation: "",
    designation: "",
    organization: "",
    pressConference: "",
    registrationType: "",
    fullName: "",
    email: "",
    phone: "",
    affiliation: "",
    speciality: "",
    paperCategory: "",
    session: "",
    paperTitle: "",
    abstract: "",
    spouse: false,
    accDesignation: [""],
    country: "",
    file: null,
    agree: false,
    paymentMethod: "",
    foreignCountry: "",
    foreignBankDetails: "",
  });

  const [registrationFee, setRegistrationFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false); // Add state for submission status
  const [errorMessage, setErrorMessage] = useState(""); // Add state for error message

  const categoryFees = {
    "SSN Members EARLY BIRD TILL FEB 28": "12000",
    "SSN Members REGULAR UP TO MARCH 31": "14000",
    "SSN Members SPOT REGISTRATION": "16000",
    "SSN-Non Members EARLY BIRD TILL FEB 28": "14000",
    "SSN-Non Members REGULAR UP TO MARCH 31": "16000",
    "SSN-Non Members SPOT REGISTRATION": "18000",
    "Associate Members/Residents": "10000",
    "SAARC Delegates EARLY BIRD TILL FEB 28": "150",
    "SAARC Delegates REGULAR UP TO MARCH 31": "175",
    "SAARC Delegates SPOT REGISTRATION": "200",
    "International Delegates EARLY BIRD TILL FEB 28": "200",
    "International Delegates REGULAR UP TO MARCH 31": "225",
    "International Delegates SPOT REGISTRATION": "250",
    "SAARC Residents": "250",
  };

  const spouseFee = {
    NPR: 8000,
    $: 100,
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Update registration fee when category changes
    if (name === "category") {
      const fee = categoryFees[value] || "0";
      const currency =
        value.includes("SAARC") || value.includes("International")
          ? "$"
          : "NPR";
      setRegistrationFee(`${currency} ${fee}`); // Include currency symbol
    }

    if (name === "spouse" || name === "category") {
      calculateTotalAmount({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const calculateTotalAmount = (updatedFormData = formData) => {
    let total = parseFloat(categoryFees[updatedFormData.category] || 0);
  
    if (updatedFormData.spouse) {
      const spouseCurrency = updatedFormData.category.includes("SAARC") || updatedFormData.category.includes("International") ? "$" : "NPR";
      const spouseAmount = spouseFee[spouseCurrency] || 0;
      total += spouseAmount * updatedFormData.accDesignation.length;
    }
  
     // Determine the currency for total amount based on category
     const currency = updatedFormData.category.includes("SAARC") || updatedFormData.category.includes("International") ? "$" : "NPR";
     setTotalAmount(`${currency} ${total}`);
  };

  const handleSpouseDesignationChange = (index, value) => {
    const newDesignations = [...formData.accDesignation];
    newDesignations[index] = value;
    setFormData({ ...formData, accDesignation: newDesignations });
    calculateTotalAmount({ ...formData, accDesignation: newDesignations });
  };

  const addSpouseDesignation = () => {
    if (formData.accDesignation.length < 5) {
      const newDesignations = [...formData.accDesignation, ""];
      setFormData({ ...formData, accDesignation: newDesignations });
      calculateTotalAmount({ ...formData, accDesignation: newDesignations });
    }
  };

  const removeSpouseDesignation = (index) => {
    const newDesignations = formData.accDesignation.filter((_, i) => i !== index);
    setFormData({ ...formData, accDesignation: newDesignations });
    calculateTotalAmount({ ...formData, accDesignation: newDesignations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.agree) {
      try {
        // Send data to the backend
        const response = await axios.post("http://127.0.0.1:5000/register", formData);

        // If the response is successful, display success message
        if (response.status === 200) {
          setIsSubmitted(true);
          setErrorMessage(""); // Clear any previous error message
        }
      } catch (error) {
        setErrorMessage("Error submitting form. Please try again.");
      }
    } else {
      alert("Please agree to receive updates before submitting.");
    }
  };

  const renderPaymentMethodFields = () => {
    if (formData.country === "India") {
      return (
        <div className="payment-info">
          <h3>Bank Details (India):</h3>
          <p>Account Number: 375201500109</p>
          <p>Bank: ICICI Bank</p>
          <p>IFSC Code: ICIC0000461</p>
          <p>Branch: Bahadurgarh, Haryana</p>
        </div>
      );
    }
    if (formData.country === "Nepal") {
      return (
        <div className="payment-info">
          <h3>Bank Details (Nepal):</h3>
          <img
            src="/img4.jpg"
            alt="QR Code"
            style={{ width: "300px", height: "400px" }}
          />
          <p style={{ fontWeight: "bold" }}>Scan the QR Code for payment</p>
          <p style={{ fontWeight: "bold" }}>
            Branch Account name :- Nepalese Association of Pediatric Surgeons
            (NAPS)
          </p>
          <p>Account Number: 00205769070018</p>
          <p style={{ fontWeight: "bold" }}>
            Bank: Himalayan bank Ltd Maharajgunj
          </p>
          <p>Swift Code :- HIMANPKA</p>
        </div>
      );
    }
    if (formData.country === "Other-countries") {
      return (
        <div>
          <label>Enter Country Name:</label>
          <input
            className="box-field"
            type="text"
            name="foreignCountry"
            onChange={handleChange}
            value={formData.foreignCountry || ""}
          />
          <div className="payment-info">
            <h3>Bank Details (India):</h3>
            <p>Account Number: 375201500109</p>
            <p style={{ fontWeight: "bold" }}>Bank: ICICI Bank</p>
            <p>IFSC Code: ICIC0000461</p>
            <p>Branch: Bahadurgarh, Haryana</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header />

      <main className="main" id="main">
        <section>
          <div>
            <div className="registration-section">
              <div className="overlay">
                <h1>Registration</h1>
                <p className="sub-title">
                  Please enter your details to register for the conference.
                  Please note that registration is mandatory for approval of the
                  submitted abstract and also for participation in the
                  conference. Early bird registration closes on 21st September,
                  2024.
                </p>
                <p className="sub-title note">
                  (Please book your hotels and flight tickets early as November
                  is a peak tourist season in Pokhara. For details, please
                  contact our travel desk.)
                </p>
              </div>
            </div>

            <div className="section form-section">
              <form onSubmit={handleSubmit}>
                <div className="content-row">
                  <div className="row-item category">
                    <label>Category:</label>
                    <select
                      className="box-field"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Choose</option>
                      {Object.keys(categoryFees).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="column-item">
                    <strong>Registration Fee:</strong> {registrationFee}
                  </div>
                </div>
                <div className="content-row">
                  <div className="row-item">
                    <label>Designation:</label>
                    <input
                      className="box-field"
                      placeholder="Designation"
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row-item">
                    <label>Organization:</label>
                    <input
                      className="box-field"
                      placeholder="Organization"
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row-item">
                    <label>Are you attending the press conference event?</label>
                    <div className="radio-btn">
                      <label>
                        <input
                          type="radio"
                          name="pressConference"
                          value="Yes"
                          checked={formData.pressConference === "Yes"}
                          onChange={handleChange}
                        />
                        <span className="txt">Yes</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="pressConference"
                          value="No"
                          checked={formData.pressConference === "No"}
                          onChange={handleChange}
                        />
                        <span className="txt">No</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="content-row">
                  <div className="salutation row-item">
                    <label>Salutation:</label>
                    <select
                      className="box-field"
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                    >
                      <option value="">Choose</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Miss">Miss.</option>
                    </select>
                  </div>
                  <div className="row-item">
                    <label>Full Name :</label>
                    <input
                      className="box-field"
                      placeholder="Full Name"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row-item">
                    <label>Email :</label>
                    <input
                      className="box-field"
                      placeholder="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="content-row">
                  <div className="row-item category">
                    <label>Phone :</label>
                    <input
                      className="box-field"
                      placeholder="Phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="content-row">
                  <div className="row-item">
                    <label>Registration:</label>
                    <div className="radio-btn">
                      <label>
                        <input
                          type="radio"
                          name="registrationType"
                          value="without abstract"
                          checked={
                            formData.registrationType === "without abstract"
                          }
                          onChange={handleChange}
                        />
                        <span className="txt">without abstract</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="registrationType"
                          value="with abstract"
                          checked={
                            formData.registrationType === "with abstract"
                          }
                          onChange={handleChange}
                        />
                        <span className="txt">with abstract</span>
                      </label>
                    </div>
                  </div>
                </div>
                {formData.registrationType === "with abstract" && (
                  <>
                    <div className="content-row">
                      <div className="row-item category">
                        <label>Affiliation :</label>
                        <input
                          className="box-field"
                          placeholder="Affiliation"
                          type="text"
                          name="affiliation"
                          value={formData.affiliation}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="row-item category">
                        <label>Speciality/ Subspeciality:</label>
                        <input
                          className="box-field"
                          placeholder="Speciality/ Subspeciality"
                          type="text"
                          name="speciality"
                          value={formData.speciality}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="content-row">
                      <div className="row-item">
                        <label>Category:</label>
                        <div className="radio-btn">
                          {[
                            "Guest Paper",
                            "Free Paper",
                            "Award Paper",
                            "Poster",
                          ].map((category) => (
                            <label key={category}>
                              <input
                                type="radio"
                                name="paperCategory"
                                value={category}
                                checked={formData.paperCategory === category}
                                onChange={handleChange}
                              />
                              <span className="txt">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="content-row">
                      <div className="row-item category">
                        <label>Session:</label>
                        <select
                          className="box-field"
                          name="session"
                          value={formData.session}
                          onChange={handleChange}
                        >
                          <option value="">Select any option</option>
                          {[
                            "General paediatric surgery",
                            "Neonatal surgery",
                            "Oncology/ oncosurgery",
                            "Paediatric urology",
                            "Colorectal/ GI/ hepato",
                            "Paediatric nursing",
                            "Diagnostics",
                            "Others",
                          ].map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="row-item category">
                        <label>Title of the paper:</label>
                        <input
                          className="box-field"
                          type="text"
                          name="paperTitle"
                          value={formData.paperTitle}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="content-row">
                      <div className="row-item category">
                        <label>Abstract (max 300 words):</label>
                        <textarea
                          className="abstract-section"
                          name="abstract"
                          value={formData.abstract}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </>
                )}
                {/* Spouse checkbox and details */}
                <div className="content-row">
                  <label>
                    <input
                      type="checkbox"
                      name="spouse"
                      checked={formData.spouse}
                      onChange={handleChange}
                    />
                    I have an accompanying spouse/person
                  </label>
                </div>
                {formData.spouse && (
                  <div className="content-column spouse-details mt-4">
                    <h3>Accompanying Spouse/Person Details</h3>
                    {formData.accDesignation.map((designation, index) => (
                      <div
                        className="mb-3 p-3 border rounded bg-light"
                        key={index}
                      >
                        <div className="row mb-3 p-3 border rounded bg-light align-items-center">
                          <div className="registration-fee">
                            Spouse Fee:{" "}
                            {formData.category.includes("SAARC") ||
                            formData.category.includes("International")
                              ? "$100"
                              : "NPR 8000"}
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Full Name:</label>
                            <input
                              className="form-control"
                              placeholder="Full Name"
                              type="text"
                              name="accDesignation"
                              value={designation}
                              onChange={(e) =>
                                handleSpouseDesignationChange(
                                  index,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Designation:</label>
                            <input
                              className="form-control"
                              placeholder="Designation"
                              type="text"
                              name="designation"
                            />
                          </div>
                          <div className="col-md-3">
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeSpouseDesignation(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={addSpouseDesignation}
                    >
                      Add Spouse/Person
                    </button>
                  </div>
                )}
                <div className="content-row">
                  <div className="row-item category">
                    <label>Country:</label>
                    <select
                      className="box-field"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="Nepal">Nepal</option>
                      <option value="India">India</option>
                      <option value="Other-countries">Others</option>
                    </select>
                  </div>
                </div>
                {/* Render payment method based on the country */}
                {renderPaymentMethodFields()}
                <strong>Total Amount:</strong> {totalAmount}
                <div className="content-row">
                  <div className="row-item">
                    <label>Upload Voucher:</label>
                    <input type="file" name="file" onChange={handleChange} />
                    <span className="alert-txt">
                      Only pdf, jpg, png files are accepted.
                    </span>
                  </div>
                </div>
                <div className="content-row txt-btn-holder">
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                      />
                      <span className="txt">
                        I agree to receive updates to the email address provided
                        above.
                      </span>
                    </label>
                  </div>
                  <button
                className="primary-button"
                type="button" // Change to "button" to prevent default form submission
                onClick={handleSubmit}
              >
                Submit <i className="fa-solid fa-arrow-right"></i>
              </button>

              {isSubmitted && (
                <div className="success-message">
                  <div style={{ color: "green" }}>
                    <i className="fa fa-check-circle" style={{ fontSize: "24px" }}></i>
                    <span> Registration Successful!</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="error-message">
                  <p>{errorMessage}</p>
                </div>
              )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Register;
