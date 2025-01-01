import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../css/registration.css";


const ViewRegistration = () => {
    const [registrations, setRegistrations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);  // Track the current page
    const [registrationsPerPage] = useState(10);  // Set number of registrations per page

    // Fetch the list of registrations when the component loads
    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/registrations');
                setRegistrations(response.data); // Assuming the response data is an array of registrations
            } catch (error) {
                console.error('Error fetching registrations:', error.response?.data || error.message);
            }
        };

        fetchRegistrations();
    }, []);

    const handleExportExcel = async () => {
        try {
            // Request the server to export the registrations to Excel
            const response = await axios.get('http://127.0.0.1:5000/api/registrations-excel', {
                responseType: 'blob',
            });
    
            // Create a formatted date string (e.g., "2025-01-01_12-30-45")
            const date = new Date();
            const formattedDate = date.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    
            // Create a temporary link to trigger the download with the date and time in the filename
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registrations_${formattedDate}.xlsx`);  // Use formatted date in filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);  // Revoke the URL after the download
        } catch (error) {
            console.error('Error exporting Excel:', error.response?.data || error.message);
        }
    };
    

    // Get current registrations for pagination
    const indexOfLastRegistration = currentPage * registrationsPerPage;
    const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
    const currentRegistrations = registrations.slice(indexOfFirstRegistration, indexOfLastRegistration);

    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    const viewPdf = async (registrationNumber) => {
        try {
            // Fetch the registration PDF
            const response = await axios.get(`http://127.0.0.1:5000/api/registrations-pdf/${registrationNumber}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `registration_${registrationNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error viewing registration PDF:', error.response?.data || error.message);
        }
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(registrations.length / registrationsPerPage);

    return (
        <div className="registrations-container">
            <h2>View Registrations</h2>
            <button className="export-button" onClick={handleExportExcel}>
                Export to Excel
            </button>
            <table className="table">
                <thead>
                    <tr>
                        <th>Registration Number</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRegistrations.length > 0 ? (
                        currentRegistrations.map((registration) => (
                            <tr key={registration.registration_number}>
                                <td>{registration.registration_number}</td>
                                <td>{registration.full_name}</td>
                                <td>{registration.email}</td>
                                <td>{registration.phone}</td>
                                <td>{registration.category}</td>
                                <td>
                                    <button className="view-button" onClick={() => viewPdf(registration.registration_number)}>
                                        View PDF
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-registrations">No registrations found.</td>
                        </tr>
                    )}
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
        </div>
    );
};

export default ViewRegistration;
