import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Reports from "./components/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./components/Admin"; // Import the Admin component

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />                        
                    </ProtectedRoute>
                } />
                <Route path="/reports" element={
                    <ProtectedRoute requiredRole="head_of_planning">
                        <Reports />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                        <Admin />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;