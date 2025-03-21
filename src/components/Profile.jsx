import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch user profile
    useEffect(() => {
        fetchProfile();
    }, []);

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

    return (
        <div className="card">
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
    );
};

export default Profile;