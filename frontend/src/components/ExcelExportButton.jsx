import React, { useState } from 'react';
import axios from 'axios';

const ExcelExportButton = ({ userEmail, currentMonth, currentYear }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleExportToEmail = async () => {
        setIsLoading(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://localhost:8080/mywallet/excel/export/monthly/email', {
                userEmail: userEmail,
                month: currentMonth,
                year: currentYear
            });

            if (response.data.success) {
                setMessage('✅ Report sent to your email successfully!');
            } else {
                setMessage('❌ Failed to send report: ' + response.data.message);
            }
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        setIsLoading(true);
        setMessage('');
        
        try {
            const response = await axios.get('http://localhost:8080/mywallet/excel/download/monthly', {
                params: {
                    userEmail: userEmail,
                    month: currentMonth,
                    year: currentYear
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expense_report_${getMonthName(currentMonth).toLowerCase()}_${currentYear}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMessage('✅ Report downloaded successfully!');
        } catch (error) {
            setMessage('❌ Error downloading report: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const getMonthName = (month) => {
        const monthNames = [
            '', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month];
    };

    return (
        <div className="excel-export-container">
            <h3>📊 Export Monthly Report</h3>
            <p>Generate and download your monthly expense report for {getMonthName(currentMonth)} {currentYear}</p>
            
            <div className="export-buttons">
                <button 
                    onClick={handleExportToEmail}
                    disabled={isLoading}
                    className="export-btn email-btn"
                >
                    {isLoading ? '📧 Sending...' : '📧 Send to Email'}
                </button>
                
                <button 
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="export-btn download-btn"
                >
                    {isLoading ? '⬇️ Downloading...' : '⬇️ Download Excel'}
                </button>
            </div>
            
            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
            
            <div className="export-info">
                <h4>📋 Report Includes:</h4>
                <ul>
                    <li>Monthly Summary (Income, Expenses, Net Amount)</li>
                    <li>Detailed Transaction List</li>
                    <li>Category Breakdown</li>
                    <li>Budget vs Actual Comparison</li>
                </ul>
            </div>
        </div>
    );
};

export default ExcelExportButton;
