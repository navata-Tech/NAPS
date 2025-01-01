import React, { useState, useEffect } from 'react';
import "../css/registration.css";

const ViewEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [enquiriesPerPage] = useState(10);  // Pagination with a minimum of 10 items per page
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/enquiry');
        if (!response.ok) {
          throw new Error('Failed to fetch enquiries');
        }
        const data = await response.json();
        setEnquiries(data);
      } catch (err) {
        setError('There was an error retrieving the enquiries.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  // Calculate the total number of pages
  const totalPages = Math.ceil(enquiries.length / enquiriesPerPage);

  const indexOfLastEnquiry = currentPage * enquiriesPerPage;
  const indexOfFirstEnquiry = indexOfLastEnquiry - enquiriesPerPage;
  const currentEnquiries = enquiries.slice(indexOfFirstEnquiry, indexOfLastEnquiry);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewEnquiry = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/enquiry/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch enquiry details');
      }
      const data = await response.json();

      // Open a new window to display the enquiry details
      const enquiryWindow = window.open('', '_blank', 'width=600,height=400');
      enquiryWindow.document.write(`
        <html>
          <head>
            <title>Enquiry Details</title>
          </head>
          <body>
            <h3>Enquiry Details</h3>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
          </body>
        </html>
      `);
      enquiryWindow.document.close();  // Close the document to render it
    } catch (err) {
      setError('There was an error retrieving the enquiry details.');
    }
  };

  return (
    <div className="registrations-container">
      <h2>Enquiries</h2>

      {loading ? (
        <div className="loader">
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="no-registrations">
          <p>No enquiries available.</p>
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEnquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.id}</td>
                  <td>{enquiry.name}</td>
                  <td>{enquiry.phone}</td>
                  <td>{enquiry.email}</td>
                  <td>{enquiry.message}</td>
                  <td>{new Date(enquiry.date).toLocaleDateString()}</td>
                  <td>
                    <button className="view-button" onClick={() => handleViewEnquiry(enquiry.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Component */}
          <div className="pagination-container">
            <ul className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewEnquiry;
