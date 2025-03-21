import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
    const [formData, setFormData] = useState({ month: "", year: new Date().getFullYear(), count: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 10,
        total_pages: 1,
        total_records: 0,
        has_next: false,
        has_prev: false
    });
    const [filters, setFilters] = useState({ year: "", month: "" });
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: ""
    });
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    });
    const [showProfile, setShowProfile] = useState(false); // State to control profile visibility
    const navigate = useNavigate();

    // Get the department name from local storage
    const department = localStorage.getItem('department');

    // Get the current month and year
    const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JavaScript
    const currentYear = new Date().getFullYear();

    // Months for the dropdown
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString("default", { month: "long" }),
        disabled: formData.year > currentYear || (formData.year === currentYear && i + 1 > currentMonth)
    }));

    // Fetch user profile and history on component mount
    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, [pagination.page, filters, pagination.per_page]);

    // Fetch user profile
    const fetchProfile = async () => {
        try {
            const response = await axios.get("https://report-management-system-backend.onrender.com/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setProfile(response.data);
            setProfileForm({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
                password: ""
            });
        } catch (error) {
            setError("Failed to fetch profile");
        }
    };

    // Fetch service history
    const fetchHistory = async () => {
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                per_page: pagination.per_page,
                ...filters
            });

            const response = await axios.get(`https://report-management-system-backend.onrender.com/services/history?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });

            setHistory(response.data.history);
            setPagination(response.data.pagination);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError("Failed to fetch history");
            }
        }
    };

    // Handle service submission or update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const url = editingId 
                ? `https://report-management-system-backend.onrender.com/services/update/${editingId}`
                : "https://report-management-system-backend.onrender.com/services";

            const method = editingId ? 'put' : 'post';
            
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });

            setSuccess(editingId ? "Record updated successfully!" : "Record submitted successfully!");
            setFormData({ month: "", year: new Date().getFullYear(), count: 0 });
            setEditingId(null);
            fetchHistory();
        } catch (error) {
            setError(error.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.put(
                "https://report-management-system-backend.onrender.com/profile/update",
                profileForm,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
                }
            );

            setSuccess(response.data.message);
            setEditProfile(false);
            fetchProfile(); // Refresh profile data
        } catch (error) {
            setError(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // Handle profile form changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle edit for service records
    const handleEdit = (record) => {
        setFormData({
            month: record.month,
            year: record.year,
            count: record.service_count
        });
        setEditingId(record.id);
    };

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
    };

    // Handle records per page changes
    const handlePerPageChange = (e) => {
        const perPage = parseInt(e.target.value);
        setPagination(prev => ({ ...prev, per_page: perPage, page: 1 })); // Reset to first page
    };

    // Handle logout
    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('department');

        // Redirect to login page
        navigate('/login');
    };

    return (      
        <div className="container mx-auto p-6">
            {/* Header with Logout Button and View Profile Button */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">{department} Report</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowProfile(!showProfile)} // Toggle profile visibility
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                    >
                        {showProfile ? "Hide Profile" : "View Profile"}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
                    {success}
                </div>
            )}

            {/* Profile Section (Conditionally Rendered) */}
            {showProfile && (
                <div className="card mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Profile</h2>
                    {editProfile ? (
                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileForm.first_name}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileForm.last_name}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={profileForm.password}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditProfile(false)}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    {loading ? "Updating..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">First Name</label>
                                    <p className="p-3 bg-gray-100 rounded-lg">{profile.first_name}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Last Name</label>
                                    <p className="p-3 bg-gray-100 rounded-lg">{profile.last_name}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Email</label>
                                    <p className="p-3 bg-gray-100 rounded-lg">{profile.email}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Department</label>
                                    <p className="p-3 bg-gray-100 rounded-lg">{profile.department}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setEditProfile(true)}
                                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Rest of the code remains unchanged */}
            {/* Service Submission/Edit Form */}
            <form onSubmit={handleSubmit} className="card mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    {editingId ? "Edit Service Record" : "New Service Record"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Month</label>
                        <select
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            required
                        >
                            <option value="">Select Month</option>
                            {months.map((month) => (
                                <option
                                    key={month.value}
                                    value={month.value}
                                    disabled={month.disabled}
                                >
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Year</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            min="2020"
                            max={currentYear}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Number of Services</label>
                        <input
                            type="number"
                            value={formData.count}
                            onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                >
                    {loading ? "Submitting..." : editingId ? "Update Record" : "Submit Record"}
                </button>
            </form>

            {/* Filters */}
            <div className="card mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Year</label>
                        <input
                            type="number"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            placeholder="Filter by year"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Month</label>
                        <select
                            name="month"
                            value={filters.month}
                            onChange={handleFilterChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        >
                            <option value="">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Records Per Page</label>
                        <select
                            value={pagination.per_page}
                            onChange={handlePerPageChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Submission History */}
            <div className="card">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Records History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-4 text-left font-medium text-gray-700">Month</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-700">Year</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-700">Number of Services</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {new Date(0, record.month - 1).toLocaleString("default", { month: "long" })}
                                    </td>
                                    <td className="px-6 py-4">{record.year}</td>
                                    <td className="px-6 py-4">{record.service_count}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="bg-white text-blue-500 border border-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.has_prev}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.has_next}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;