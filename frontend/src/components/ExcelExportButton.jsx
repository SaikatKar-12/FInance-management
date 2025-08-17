import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelExportButton = ({ categoryData, currentMonth, currentYear }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleDownload = () => {
        try {
            setIsLoading(true);
            setMessage('');
            
            if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) {
                throw new Error('No category data available to export');
            }
            
            // Calculate total for percentage calculation
            const total = categoryData.reduce((sum, item) => {
                const amount = Number(item.amount) || 0;
                return sum + amount;
            }, 0);
            
            // Prepare data for Excel with category name, amount, and percentage
            const excelData = categoryData.map(item => {
                const categoryName = item.name || item.category || 'Uncategorized';
                const amount = Number(item.amount) || 0;
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                
                return {
                    'Category': categoryName,
                    'Amount (₹)': amount.toFixed(2),
                    'Percentage': percentage.toFixed(2) + '%'
                };
            });

            // Add total row
            if (total > 0) {
                excelData.push({
                    'Category': 'TOTAL',
                    'Amount (₹)': total.toFixed(2),
                    'Percentage': '100.00%'
                });
            }

            // Create a new workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const wscols = [
                {wch: 25}, // Category column width
                {wch: 15}, // Amount column width
                {wch: 15}  // Percentage column width
            ];
            ws['!cols'] = wscols;
            
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Category Summary');
            
            // Generate Excel file with month and year in the filename
            const monthName = getMonthName(Number(currentMonth)).toLowerCase();
            XLSX.writeFile(wb, `expense_summary_${monthName}_${currentYear}.xlsx`);
            
            setMessage('✅ Report downloaded successfully!');
        } catch (error) {
            console.error('Error generating Excel:', error);
            setMessage('❌ Error: ' + (error.message || 'Failed to generate report'));
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
        <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            margin: '20px 0'
        }}>
            <h3 style={{
                color: '#2c3e50',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📊 {getMonthName(currentMonth)} {currentYear} Expense Report
            </h3>
            
            <div style={{
                display: 'flex',
                gap: '12px',
                margin: '16px 0',
                justifyContent: 'center'
            }}>
                <button 
                    onClick={handleDownload}
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1d6f42',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#165a36'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1d6f42'}
                >
                    {isLoading ? '📊 Generating...' : '📊 Download Excel'}
                </button>
            </div>
            
            {message && (
                <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
                    color: message.includes('✅') ? '#2e7d32' : '#c62828',
                    fontSize: '0.9em',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {message.includes('✅') ? '✓' : '!'} {message}
                </div>
            )}
            
            <div style={{
                backgroundColor: '#f8f9fa',
                borderLeft: '4px solid #4a6cf7',
                padding: '12px 16px',
                borderRadius: '6px',
                marginTop: '16px',
                fontSize: '0.9em',
                color: '#495057'
            }}>
                <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Your report includes:</strong>
                </p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Category-wise expense summary</li>
                    <li>Amount spent per category</li>
                    <li>Percentage of total expenses</li>
                </ul>
            </div>
        </div>
    );
};

export default ExcelExportButton;
