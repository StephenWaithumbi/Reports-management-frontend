import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const Reports = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const navigate = useNavigate();

    // Fetch reports when the year changes
    useEffect(() => {
        fetchReports();
    }, [year]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get("http://127.0.0.1:5000/reports", {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                params: { year }
            });

            setReportData(response.data.report);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError(error.response?.data?.error || "Failed to fetch reports");
            }
        } finally {
            setLoading(false);
        }
    };

    // Months for table headers
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Function to export the report to Excel
    const exportToExcel = () => {
        // Prepare the data for Excel
        const excelData = reportData.map((row) => {
            const formattedRow = { Department: row.department };
            months.forEach((month, index) => {
                formattedRow[month] = row[index + 1] === null ? "" : row[index + 1]; // Blank for future months
            });
            return formattedRow;
        });

        // Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        // Write the file and trigger download
        XLSX.writeFile(workbook, `Department_Report_${year}.xlsx`);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-primary">Department Reports</h1>

            {/* Year Filter and Export Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <label className="block text-gray-700 mb-2 font-medium">Select Year</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        min="2020"
                        max={new Date().getFullYear()}
                    />
                </div>
                <button
                    onClick={exportToExcel}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
                >
                    Export to Excel
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Report Table */}
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-6 py-4 text-left font-medium text-gray-700">Department</th>
                            {months.map((month, index) => (
                                <th key={index} className="px-6 py-4 text-left font-medium text-gray-700">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-700">{row.department}</td>
                                {months.map((_, monthIndex) => (
                                    <td key={monthIndex} className="px-6 py-4">
                                        {row[monthIndex + 1] === null ? (
                                            <span className="text-gray-400">-</span> // Blank for future months
                                        ) : (
                                            row[monthIndex + 1] // 0 or the actual count
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;