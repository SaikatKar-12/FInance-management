package com.fullStack.expenseTracker.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ExcelExportService excelExportService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendMonthlyExcelReport(String userEmail, int month, int year) throws MessagingException, IOException {
        System.out.println("Preparing to send email to: " + userEmail);
        System.out.println("Using SMTP host: " + ((JavaMailSenderImpl)mailSender).getHost());
        System.out.println("Using SMTP port: " + ((JavaMailSenderImpl)mailSender).getPort());
        
        try {
            // Generate Excel report
            System.out.println("Generating Excel report...");
            byte[] excelData = excelExportService.generateMonthlyExcelReport(userEmail, month, year);
            System.out.println("Excel report generated successfully");
            
            // Create email message
            System.out.println("Creating email message...");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set email details
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            String subject = "Monthly Expense Report - " + getMonthName(month) + " " + year;
            helper.setSubject(subject);
            System.out.println("Email subject: " + subject);
            
            // Email body
            String emailBody = createEmailBody(month, year);
            helper.setText(emailBody, true); // true indicates HTML content
            
            // Attach Excel file
            String fileName = "expense_report_" + getMonthName(month).toLowerCase() + "_" + year + ".xlsx";
            System.out.println("Attaching file: " + fileName);
            ByteArrayResource resource = new ByteArrayResource(excelData);
            helper.addAttachment(fileName, resource);
            
            // Send email
            System.out.println("Sending email...");
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + userEmail);
            
        } catch (Exception e) {
            System.err.println("Error in sendMonthlyExcelReport: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            throw e;
        }
    }

    private String createEmailBody(int month, int year) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #007bff; margin: 0;">📊 Monthly Expense Report</h2>
                        <p style="margin: 10px 0 0 0; color: #666;">Your financial summary for <strong>%s %d</strong></p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <h3 style="color: #28a745; margin-top: 0;">📋 Report Contents</h3>
                        <ul style="color: #555;">
                            <li><strong>Monthly Summary:</strong> Overview of income, expenses, and net amount</li>
                            <li><strong>Transaction Details:</strong> Complete list of all transactions</li>
                            <li><strong>Category Breakdown:</strong> Spending analysis by category</li>
                            <li><strong>Budget vs Actual:</strong> Comparison of planned vs actual spending</li>
                        </ul>
                        
                        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
                            <p style="margin: 0; color: #0056b3;">
                                <strong>💡 Tip:</strong> Use this report to analyze your spending patterns and identify areas for improvement.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                        <p>This report was generated automatically by your Expense Tracker application.</p>
                        <p>If you have any questions, please contact support.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(getMonthName(month), year);
    }

    private String getMonthName(int month) {
        String[] monthNames = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return monthNames[month];
    }
}
