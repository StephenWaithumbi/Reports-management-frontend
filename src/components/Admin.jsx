import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState("users"); // Tabs: users, departments
    const [searchQuery, setSearchQuery] = useState("");
    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        department_id: "",
        role: "department_user"
    });
    const [newDepartment, setNewDepartment] = useState({ name: "" });
    const navigate = useNavigate();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // 5 items per page

    // Fetch users and departments on component mount
    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get("https://report-management-system-backend.onrender.com/users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setUsers(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError("Failed to fetch users");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch all departments
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get("https://report-management-system-backend.onrender.com/departments", {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setDepartments(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError("Failed to fetch departments");
            }
        } finally {
            setLoading(false);
        }
    };

    // Add a new user
    const addUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const response = await axios.post("https://report-management-system-backend.onrender.com/register", newUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setSuccess("User added successfully!");
            setNewUser({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                department_id: "",
                role: "department_user"
            });
            fetchUsers(); // Refresh the users list
        } catch (error) {
            setError(error.response?.data?.error || "Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    // Delete a user
    const deleteUser = async (userId) => {
        try {
            setLoading(true);
            setError("");
            await axios.delete(`https://report-management-system-backend.onrender.com/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setSuccess("User deleted successfully!");
            fetchUsers(); // Refresh the users list
        } catch (error) {
            setError("Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    // Reset a user's password
    const resetPassword = async (userId) => {
        try {
            setLoading(true);
            setError("");
            await axios.put(`https://report-management-system-backend.onrender.com/users/${userId}/reset-password`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setSuccess("Password reset successfully!");
        } catch (error) {
            setError("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    // Add a new department
    const addDepartment = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const response = await axios.post("https://report-management-system-backend.onrender.com/departments", newDepartment, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setSuccess("Department added successfully!");
            setNewDepartment({ name: "" });
            fetchDepartments(); // Refresh the departments list
        } catch (error) {
            setError(error.response?.data?.error || "Failed to add department");
        } finally {
            setLoading(false);
        }
    };

    // Delete a department
    const deleteDepartment = async (departmentId) => {
        try {
            setLoading(true);
            setError("");
            await axios.delete(`https://report-management-system-backend.onrender.com/departments/${departmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setSuccess("Department deleted successfully!");
            fetchDepartments(); // Refresh the departments list
        } catch (error) {
            setError("Failed to delete a department with users. Delete users the first");
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic for users
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Pagination logic for departments
    const indexOfLastDepartment = currentPage * itemsPerPage;
    const indexOfFirstDepartment = indexOfLastDepartment - itemsPerPage;
    const currentDepartments = departments.slice(indexOfFirstDepartment, indexOfLastDepartment);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-primary">Admin Dashboard</h1>

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

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => { setActiveTab("users"); setCurrentPage(1); }}
                    className={`px-6 py-2 rounded-lg ${
                        activeTab === "users" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                    Users
                </button>
                <button
                    onClick={() => { setActiveTab("departments"); setCurrentPage(1); }}
                    className={`px-6 py-2 rounded-lg ${
                        activeTab === "departments" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                    Departments
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === "users" && (
                <div>
                    {/* Add User Form */}
                    <form onSubmit={addUser} className="card mb-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New User</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">First Name</label>
                                <input
                                    type="text"
                                    value={newUser.first_name}
                                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Last Name</label>
                                <input
                                    type="text"
                                    value={newUser.last_name}
                                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Department</label>
                                <select
                                    value={newUser.department_id}
                                    onChange={(e) => setNewUser({ ...newUser, department_id: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                        >
                            {loading ? "Adding..." : "Add User"}
                        </button>
                    </form>

                    {/* Users List */}
                    <div className="card">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Users List</h2>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Name</th>
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Email</th>
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Department</th>
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{`${user.first_name} ${user.last_name}`}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{user.department || "N/A"}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button
                                                    onClick={() => resetPassword(user.id)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    Reset Password
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination for Users */}
                        <div className="mt-6 flex justify-center">
                            {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-4 py-2 mx-1 rounded-lg ${
                                        currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Departments Tab */}
            {activeTab === "departments" && (
                <div>
                    {/* Add Department Form */}
                    <form onSubmit={addDepartment} className="card mb-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Department</h2>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-medium">Department Name</label>
                            <input
                                type="text"
                                value={newDepartment.name}
                                onChange={(e) => setNewDepartment({ name: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                        >
                            {loading ? "Adding..." : "Add Department"}
                        </button>
                    </form>

                    {/* Departments List */}
                    <div className="card">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Departments List</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Name</th>
                                        <th className="px-6 py-4 text-left font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDepartments.map((dept) => (
                                        <tr key={dept.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{dept.name}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => deleteDepartment(dept.id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination for Departments */}
                        <div className="mt-6 flex justify-center">
                            {Array.from({ length: Math.ceil(departments.length / itemsPerPage) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-4 py-2 mx-1 rounded-lg ${
                                        currentPage === i + 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;