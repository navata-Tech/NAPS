import { useState, useEffect } from "react"; // Add this import
import axios from "axios";
import "../css/register-about.css";

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

  const [registrationFee, setRegistrationFee] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    let tempErrors = {};

    // Mandatory field validation
    if (!formData.category) tempErrors.category = "Category is required.";
    if (!formData.designation)
      tempErrors.designation = "Designation is required.";
    if (!formData.organization)
      tempErrors.organization = "Organization is required.";
    if (!formData.pressConference)
      tempErrors.pressConference = "Press conference attendance is required.";
    if (!formData.salutation) tempErrors.salutation = "Salutation is required.";
    if (!formData.fullName) tempErrors.fullName = "Full Name is required.";
    // Email validation (must contain @)
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!formData.email.includes("@")) {
      tempErrors.email = "Please enter a valid email address.";
    }
    if (!formData.phone) tempErrors.phone = "Phone number is required.";
    if (!formData.registrationType)
      tempErrors.registrationType = "Registration type is required.";
    if (!formData.agree)
      tempErrors.agree = "You must agree to receive updates.";
    if (!formData.file) tempErrors.file = "Voucher upload is required.";
    if (!formData.file) tempErrors.country = "country is required.";

    // Additional validation for "with abstract" type
    if (formData.registrationType === "with abstract") {
      if (!formData.affiliation)
        tempErrors.affiliation =
          "Affiliation is required for abstract submission.";
      if (!formData.speciality)
        tempErrors.speciality =
          "Speciality is required for abstract submission.";
      if (!formData.paperCategory)
        tempErrors.paperCategory = "Paper category is required.";
      if (!formData.session) tempErrors.session = "Session is required.";
      if (!formData.paperTitle)
        tempErrors.paperTitle = "Paper title is required.";
      if (!formData.abstract) tempErrors.abstract = "Abstract is required.";
    }

    // Validation for spouse
    if (formData.spouse && formData.accDesignation.some((d) => !d)) {
      tempErrors.accDesignation = "All spouse details are required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
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

    if (name === "category") {
      const fee = categoryFees[value] || "0";
      const currency =
        value.includes("SAARC") || value.includes("International")
          ? "$"
          : "NPR";
      setRegistrationFee(`${currency} ${fee}`);
    }

    if (name === "spouse" || name === "category") {
      calculateTotalAmount({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  useEffect(() => {
    calculateTotalAmount(formData);
  }, [formData.category, formData.spouse, formData.accDesignation]);

  const calculateTotalAmount = (updatedFormData) => {
    let total = parseFloat(categoryFees[updatedFormData.category] || 0);
    const isForeign =
      updatedFormData.category.includes("SAARC") ||
      updatedFormData.category.includes("International");

    if (updatedFormData.spouse) {
      const spouseAmount = spouseFee[isForeign ? "$" : "NPR"] || 0;
      total += spouseAmount * updatedFormData.accDesignation.length;
    }

    const currency = isForeign ? "$" : "NPR";
    setRegistrationFee(
      `${currency} ${parseFloat(categoryFees[updatedFormData.category] || 0)}`
    );
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
    const newDesignations = formData.accDesignation.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, accDesignation: newDesignations });
    calculateTotalAmount({ ...formData, accDesignation: newDesignations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    // Ensure numeric values for backend
    const registrationFeeValue =
      parseFloat(registrationFee.replace(/[^\d.-]/g, "")) || 0;

    const totalAmountValue =
      parseFloat(totalAmount.replace(/[^\d.-]/g, "")) || 0;

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "file") {
        dataToSend.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => dataToSend.append(`${key}[]`, item));
      } else {
        dataToSend.append(key, value);
      }
    });

    // Append numeric values
    dataToSend.append("registrationFee", registrationFeeValue);
    dataToSend.append("totalAmount", totalAmountValue);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVERAPI}/register`,
        dataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsSubmitted(true);
        setErrorMessage("");
        setTimeout(() => {
          setFormData({
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
          setIsSubmitted(false);
        }, 5000);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle the case when the email already exists or any other validation error
        console.error("Error: ", error.response.data.error);
        setErrorMessage(`Error: ${error.response.data.error}`); // Display the error message
        alert(`Error: ${error.response.data.error}`);
      } else {
        console.error("Unexpected error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  const renderPaymentMethodFields = () => {
    if (formData.country === "India") {
      return (
        <div className="payment-info">
          <h3>Bank Details (India):</h3>
          <h3>Account Name: Vikas Joon</h3>
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
            style={{ width: "300px", height: "300px" }}
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
          <p style={{ fontWeight: "bold" }}>Esewa Number : 9851029644</p>
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
            <h3>Bank Details (Others):</h3>
            <p style={{ fontWeight: "bold" }}>Bank: Himalayan bank Ltd</p>
            <p>Account Number: 00205769070018</p>
            <p>Swift Code: HIMANPKA</p>
            <p>
              Branch Account name:- Nepalese Association of Pediatric Surgeons
              (NAPS)
            </p>
            <p>Branch: Maharajgunj, Nepal</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <main className="main" id="main">
        <section>
          <div>
            <div className="header-title">
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
                    {errors.file && (
                      <span className="error">{errors.category}</span>
                    )}{" "}
                    {/* Error message */}
                  </div>
                  <div className="row-item">
                    <div>
                      <label>Registration Fees:</label>
                      <span className="registration-fee">
                        {" "}
                        {registrationFee}
                      </span>
                    </div>
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
                    {errors.file && (
                      <span className="error">{errors.designation}</span>
                    )}{" "}
                    {/* Error message */}
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
                    {errors.file && (
                      <span className="error">{errors.organization}</span>
                    )}{" "}
                    {/* Error message */}
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
                        <span
                          className="txt
                        "
                        >
                          Yes
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="pressConference"
                          value="No"
                          checked={formData.pressConference === "No"}
                          onChange={handleChange}
                        />
                        <span
                          className="txt
                        "
                        >
                          No
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {errors.file && (
                  <span className="error">{errors.pressConference}</span>
                )}{" "}
                {/* Error message */}
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
                    {errors.file && (
                      <span className="error">{errors.salutation}</span>
                    )}{" "}
                    {/* Error message */}
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
                    {errors.file && (
                      <span className="error">{errors.fullName}</span>
                    )}{" "}
                    {/* Error message */}
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
                    {errors.email && (
                      <span className="error">{errors.email}</span>
                    )}
                  </div>
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
                    {errors.file && (
                      <span className="error">{errors.phone}</span>
                    )}{" "}
                    {/* Error message */}
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
                        <span
                          className="txt
                        "
                        >
                          without abstract
                        </span>
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
                        <span
                          className="txt
                        "
                        >
                          with abstract
                        </span>
                      </label>
                    </div>
                    {errors.file && (
                      <span className="error">{errors.registrationType}</span>
                    )}{" "}
                    {/* Error message */}
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
                        {errors.file && (
                          <span className="error">{errors.affiliation}</span>
                        )}{" "}
                        {/* Error message */}
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
                        {errors.file && (
                          <span className="error">{errors.speciality}</span>
                        )}{" "}
                        {/* Error message */}
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
                    {errors.file && (
                      <span className="error">{errors.paperCategory}</span>
                    )}{" "}
                    {/* Error message */}
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
                        {errors.file && (
                          <span className="error">{errors.session}</span>
                        )}{" "}
                        {/* Error message */}
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
                        {errors.file && (
                          <span className="error">{errors.paperTitle}</span>
                        )}{" "}
                        {/* Error message */}
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
                        {errors.file && (
                          <span className="error">{errors.abstract}</span>
                        )}{" "}
                        {/* Error message */}
                      </div>
                    </div>
                  </>
                )}
                {/* Spouse checkbox and details */}
                <div className="row-item category">
                  <label>
                    <input
                      type="checkbox"
                      name="spouse"
                      checked={formData.spouse}
                      onChange={handleChange}
                    />

                    <span className="txt">
                      {" "}
                      I have an accompanying spouse/person
                    </span>
                  </label>
                </div>
                <div
                  className="person-details
                "
                >
                  {formData.spouse && (
                    <div className="content-column spouse-details">
                      <h3>Accompanying Spouse/Person Details</h3>
                      {formData.accDesignation.map((designation, index) => (
                        <div key={index}>
                          <div>
                            <div
                              className="content-row
                            "
                            >
                              <div>
                                <label className="form-label">Full Name:</label>
                                <input
                                  className="box-field"
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
                              <div>
                                <label className="form-label">
                                  Designation:
                                </label>
                                <input
                                  className="box-field"
                                  placeholder="Designation"
                                  type="text"
                                  name="designation"
                                />
                              </div>
                            </div>
                            {errors.file && (
                              <span className="error">
                                {errors.accDesignation}
                              </span>
                            )}{" "}
                            {/* Error message */}
                            <div className="partner-fee">
                              Spouse Fee:{" "}
                              {formData.category.includes("SAARC") ||
                              formData.category.includes("International")
                                ? "$100"
                                : "NPR 8000"}
                            </div>
                          </div>
                          <div
                            className="btn-holder
                          "
                          >
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => removeSpouseDesignation(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-btn"
                        onClick={addSpouseDesignation}
                      >
                        Add a person
                      </button>
                    </div>
                  )}
                </div>
                <div className="content-row">
                  <div className="row-item category">
                    <label>Country:</label>
                    <select
                      className="box-field"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="">Choose Country</option>
                      <option value="Nepal">Nepal</option>
                      <option value="India">India</option>
                      <option value="Other-countries">Others</option>
                    </select>
                    {errors.file && (
                      <span className="error">{errors.country}</span>
                    )}{" "}
                    {/* Error message */}
                    <span> {renderPaymentMethodFields()}</span>
                  </div>
                </div>
                <div className="content-row">
                  <div className="row-item category"></div>
                </div>
                <div className="content-row">
                  <span className="total-amt">Total Amount:</span>
                  <span className="total-price"> {totalAmount}</span>
                </div>
                <div className="content-row">
                  <div className="row-item">
                    <label>Upload Voucher:</label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleChange}
                      accept=".pdf,.jpg,.png"
                    />
                    <span className="alert-txt">
                      Only pdf, jpg, png files are accepted.
                    </span>
                    {errors.file && (
                      <span className="error">{errors.file}</span>
                    )}{" "}
                    {/* Error message */}
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
                    {errors.file && (
                      <span className="error">{errors.agree}</span>
                    )}{" "}
                    {/* Error message */}
                  </div>

                  <button
                    className="primary-button"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Submit <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
                <div>
                  {isSubmitted && (
                    <div className="message-box success-message">
                      <div style={{ color: "green" }}>
                        <i
                          className="fa fa-check-circle"
                          style={{ fontSize: "24px", marginRight: "10px" }}
                        ></i>
                        <span>
                          Thank you for registration, you'll get confirmation
                          email after verification.
                        </span>
                      </div>
                    </div>
                  )}
                  {errorMessage && (
                    <div className="message-box error-message">
                      <p>{errorMessage}</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Register;
