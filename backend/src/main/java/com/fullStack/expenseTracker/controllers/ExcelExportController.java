package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.requests.ExcelExportRequestDto;
import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.services.EmailService;
import com.fullStack.expenseTracker.services.ExcelExportService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/mywallet/excel")
public class ExcelExportController {

    @Autowired
    private ExcelExportService excelExportService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/export/monthly")
    public ResponseEntity<ApiResponseDto<?>> exportMonthlyReport(@RequestBody @Valid ExcelExportRequestDto requestDto) {
        try {
            // Generate Excel report
            byte[] excelData = excelExportService.generateMonthlyExcelReport(
                requestDto.getUserEmail(), 
                requestDto.getMonth(), 
                requestDto.getYear()
            );

            // Return success response with file data
            return ResponseEntity.ok(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                "Report generated for " + requestDto.getMonth() + "/" + requestDto.getYear()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto<>(
                ApiResponseStatus.FAILED,
                HttpStatus.BAD_REQUEST,
                "Failed to generate report: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/export/monthly/email")
    public ResponseEntity<ApiResponseDto<?>> exportMonthlyReportAndEmail(@RequestBody @Valid ExcelExportRequestDto requestDto) {
        try {
            System.out.println("Attempting to send email to: " + requestDto.getUserEmail());
            
            // Send email with Excel report
            emailService.sendMonthlyExcelReport(
                requestDto.getUserEmail(), 
                requestDto.getMonth(), 
                requestDto.getYear()
            );

            System.out.println("Email sent successfully to: " + requestDto.getUserEmail());
            
            return ResponseEntity.ok(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                "Report sent to " + requestDto.getUserEmail()
            ));

        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = "Failed to send email: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " (Cause: " + e.getCause().getMessage() + ")";
            }
            
            return ResponseEntity.badRequest().body(new ApiResponseDto<>(
                ApiResponseStatus.FAILED,
                HttpStatus.BAD_REQUEST,
                errorMessage
            ));
        }
    }

    @GetMapping("/download/monthly")
    public ResponseEntity<ByteArrayResource> downloadMonthlyReport(
            @RequestParam String userEmail,
            @RequestParam int month,
            @RequestParam int year) {
        
        try {
            byte[] excelData = excelExportService.generateMonthlyExcelReport(userEmail, month, year);
            
            ByteArrayResource resource = new ByteArrayResource(excelData);
            
            String fileName = "expense_report_" + getMonthName(month).toLowerCase() + "_" + year + ".xlsx";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
                
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getMonthName(int month) {
        String[] monthNames = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return monthNames[month];
    }
}
