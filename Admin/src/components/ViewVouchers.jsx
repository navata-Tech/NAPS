import React, { useState, useEffect } from "react";
import "../css/registration.css"; // Adjust CSS path as needed

const ViewVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [vouchersPerPage] = useState(10); // Pagination with a minimum of 10 items per page

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVERAPI}/api/registration-files`); // Adjust API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch vouchers");
        }
        const data = await response.json();
        setVouchers(data);
      } catch (err) {
        setError("There was an error retrieving the vouchers.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // Calculate the total number of pages
  const totalPages = Math.ceil(vouchers.length / vouchersPerPage);

  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = vouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewVoucher = async (registrationNumber) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVERAPI}/api/registration-file/${registrationNumber}`
      ); // Adjust API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch voucher details");
      }
      const data = await response.json();

      // Open a new window to display the voucher details
      const voucherWindow = window.open("", "_blank", "width=600,height=400");
      voucherWindow.document.write(`
        <html>
          <head>
            <title>Voucher Details</title>
          </head>
          <body>
            <h3>Voucher Details</h3>
            <p><strong>Registration Number:</strong> ${data.registration_number}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Total Amount:</strong> ${data.total_amount}</p>
            <!-- Changed: Updated the file URL to point directly to the backend endpoint for serving files -->
            <p><strong>File:</strong> <a href="${import.meta.env.VITE_SERVERAPI}/uploads/${data.file_name}" target="_blank" rel="noopener noreferrer">Download File</a></p>
          </body>
        </html>
      `);
      voucherWindow.document.close();
    } catch (err) {
      setError("There was an error retrieving the voucher details.");
    }
  };

  return (
    <div className="registrations-container">
      <h2>Vouchers</h2>

      {loading ? (
        <div className="loader">
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="no-registrations">
          <p>No vouchers available.</p>
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Registration Number</th>
                <th>Name</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVouchers.map((voucher) => (
                <tr key={voucher.registration_number}>
                  <td>{voucher.registration_number}</td>
                  <td>{voucher.name}</td>
                  <td>{voucher.total_amount}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewVoucher(voucher.registration_number)}
                    >
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
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
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

export default ViewVouchers;
