//GenerateWebsite.jsx
import React, { useState } from 'react';

// Define the functional component
const GenerateWebsite = () => {
  // State variables to manage form input and loading state
  const [businessName, setBusinessName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  // Event handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setLoading(true); // Set loading state to true

    try {
      // Send a POST request to the server with form data
      const response = await fetch('/generate-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName, domain }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response
      const data = await response.json();
      console.log('Response data:', data);


      setBusinessName(''); // Clear business name input
      setDomain(''); // Clear domain input
    } catch (error) {
      console.error('Error submitting form:', error); // Handle any errors
    } finally {
      setLoading(false); // Set loading state to false after request
    }
  };

  // JSX structure for the component
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="businessName">Business Name:</label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Name of your business"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="domain">Domain:</label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., Fintech, Matrimony, E-Commerce"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
};

export default GenerateWebsite;
