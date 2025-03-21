import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post('https://report-management-system-backend.onrender.com/login', formData);
            const { access_token, role } = response.data;
            
            // Store token and user info
            localStorage.setItem('authToken', access_token);
            const decoded = jwtDecode(access_token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userId', decoded.id);
            localStorage.setItem('department', response.data.department);

            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin'); // Redirect admins to the admin dashboard
            } else if (role === 'head_of_planning') {
                navigate('/reports'); // Redirect planning heads to reports
            } else {
                navigate('/dashboard'); // Redirect regular users to the dashboard
            }
        } catch (error) {
            setError(error.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <div className="card w-[450px] p-8 shadow-lg rounded-lg bg-white">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src="data:image/png;base64,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" alt="Logo" className="h-16 w-auto" />
            </div>
      
            <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      
            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
      
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded text-lg"
                  required
                />
              </div>
      
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border rounded text-lg"
                  required
                />
              </div>
      
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded text-lg hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      );
      
};

export default Login;