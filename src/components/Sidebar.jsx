import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-6">Reporting System</h2>
            <ul>
                <li className="mb-4">
                    <Link to="/dashboard" className="flex items-center p-2 hover:bg-gray-700 rounded">
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li className="mb-4">
                    <Link to="/profile" className="flex items-center p-2 hover:bg-gray-700 rounded">
                        <span>Profile</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;