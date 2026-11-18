import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {

      const response = await api.get(
        "/customers"
      );

      setCustomers(
        response.data.customers
      );

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to load customers"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="section-card">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <p>Manage your customers</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="section-card">
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{customer.phone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;