package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.models.Transaction;
import com.fullStack.expenseTracker.models.Category;
import com.fullStack.expenseTracker.models.TransactionType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import com.fullStack.expenseTracker.services.UserService;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class ExcelExportService {

    @Autowired
    private UserService userService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TransactionTypeService transactionTypeService;

    public byte[] generateMonthlyExcelReport(String userEmail, int month, int year) throws IOException {
    Long userId = null;
    User user = null;
    try {
        user = userService.findByEmail(userEmail);
        if (user == null) {
            System.err.println("ExcelExportService: User not found for email: " + userEmail);
            throw new IOException("User not found for email: " + userEmail);
        }
        userId = user.getId();
    } catch (UserNotFoundException e) {
        System.err.println("ExcelExportService: UserNotFoundException for email: " + userEmail);
        throw new IOException("User not found for email: " + userEmail);
    }
        try (Workbook workbook = new XSSFWorkbook()) {
            
            // Create Summary Sheet
            createSummarySheet(workbook, userEmail, userId, month, year);
            
            // Create Transactions Sheet
            createTransactionsSheet(workbook, userEmail, month, year);
            
            // Create Category Breakdown Sheet
            createCategoryBreakdownSheet(workbook, userEmail, month, year);
            
            // Create Budget vs Actual Sheet
            createBudgetVsActualSheet(workbook, userEmail, month, year);

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void createSummarySheet(Workbook workbook, String userEmail, Long userId, int month, int year) {
        Sheet sheet = workbook.createSheet("Monthly Summary");
        
        // Create styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        
        // Create headers
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Metric", "Value"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Add data rows
        int rowNum = 1;
        
        // Fetch all transactions for the user/month/year
List<Transaction> transactions = getTransactionsForMonth(userEmail, month, year);
double totalIncome = getTotalIncome(userId, month, year);
double totalExpense = getTotalExpenses(userId, month, year);
Map<String, Double> categoryTotals = new LinkedHashMap<>();

// Get all enabled expense categories
@SuppressWarnings("unchecked")
List<Category> categories = (List<Category>) categoryService.getCategories().getBody().getResponse();
for (Category cat : categories) {
    if (cat.isEnabled() && cat.getTransactionType().getTransactionTypeName().name().equalsIgnoreCase("EXPENSE")) {
        double catTotal = getCategoryTotal(userEmail, cat.getCategoryId(), month, year);
        if (catTotal != 0.0) {
            categoryTotals.put(cat.getCategoryName(), catTotal);
            totalExpense += catTotal;
        }
    } else if (cat.isEnabled() && cat.getTransactionType().getTransactionTypeName().name().equalsIgnoreCase("INCOME")) {
        double catTotal = getCategoryTotal(userEmail, cat.getCategoryId(), month, year);
        if (catTotal != 0.0) {
            totalIncome += catTotal;
        }
    }
}

// Write summary
Row incomeRow = sheet.createRow(rowNum++);
incomeRow.createCell(0).setCellValue("This Month Salary (Total Income)");
Cell incomeCell = incomeRow.createCell(1);
incomeCell.setCellValue(totalIncome);
incomeCell.setCellStyle(currencyStyle);
Row expenseRow = sheet.createRow(rowNum++);
expenseRow.createCell(0).setCellValue("Net Spending (Total Expenses)");
Cell expenseCell = expenseRow.createCell(1);
expenseCell.setCellValue(totalExpense);
expenseCell.setCellStyle(currencyStyle);
Row savingRow = sheet.createRow(rowNum++);
savingRow.createCell(0).setCellValue("This Month Saving");
Cell savingCell = savingRow.createCell(1);
savingCell.setCellValue(totalIncome-totalExpense);
savingCell.setCellStyle(currencyStyle);
Row transactionCountRow = sheet.createRow(rowNum++);
transactionCountRow.createCell(0).setCellValue("Total Transactions");
transactionCountRow.createCell(1).setCellValue(transactions.size());
Row monthRow = sheet.createRow(rowNum++);
monthRow.createCell(0).setCellValue("Month");
monthRow.createCell(1).setCellValue(getMonthName(month) + " " + year);
// Category-wise breakdown header
rowNum++;
Row catHeaderRow = sheet.createRow(rowNum++);
catHeaderRow.createCell(0).setCellValue("Category");
catHeaderRow.createCell(1).setCellValue("Amount");
catHeaderRow.getCell(0).setCellStyle(headerStyle);
catHeaderRow.getCell(1).setCellStyle(headerStyle);
for (Map.Entry<String, Double> entry : categoryTotals.entrySet()) {
    if (entry.getValue() != 0.0) {
        Row catRow = sheet.createRow(rowNum++);
        catRow.createCell(0).setCellValue(entry.getKey());
        Cell amtCell = catRow.createCell(1);
        amtCell.setCellValue(entry.getValue());
        amtCell.setCellStyle(currencyStyle);
    }
}
sheet.autoSizeColumn(0);
sheet.autoSizeColumn(1);
    }

    private void createTransactionsSheet(Workbook workbook, String userEmail, int month, int year) {
        Sheet sheet = workbook.createSheet("Transactions");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        
        // Create headers
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Date", "Category", "Type", "Description", "Amount"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Get transactions for the month
        @SuppressWarnings("unchecked")
        List<Transaction> transactions = (List<Transaction>) getTransactionsForMonth(userEmail, month, year);
        
        int rowNum = 1;
        for (Transaction transaction : transactions) {
            Row row = sheet.createRow(rowNum++);
            
            // Date
            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(transaction.getDate());
            dateCell.setCellStyle(dateStyle);
            
            // Category
            row.createCell(1).setCellValue(transaction.getCategory().getCategoryName());
            
            // Type
            row.createCell(2).setCellValue(transaction.getCategory().getTransactionType().getTransactionTypeName().name());
            
            // Description
            row.createCell(3).setCellValue(transaction.getDescription());
            
            // Amount
            Cell amountCell = row.createCell(4);
            amountCell.setCellValue(transaction.getAmount());
            amountCell.setCellStyle(currencyStyle);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createCategoryBreakdownSheet(Workbook workbook, String userEmail, int month, int year) {
        Sheet sheet = workbook.createSheet("Category Breakdown");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        
        // Create headers
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Category", "Type", "Total Amount", "Transaction Count"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Get categories and their totals
        @SuppressWarnings("unchecked")
        List<Category> categories = (List<Category>) categoryService.getCategories().getBody().getResponse();
        
        int rowNum = 1;
        for (Category category : categories) {
            if (category.isEnabled()) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(category.getCategoryName());
                row.createCell(1).setCellValue(category.getTransactionType().getTransactionTypeName().name());
                
                // Get total for this category
                double categoryTotal = getCategoryTotal(userEmail, category.getCategoryId(), month, year);
                Cell totalCell = row.createCell(2);
                totalCell.setCellValue(categoryTotal);
                totalCell.setCellStyle(currencyStyle);
                
                // Get transaction count for this category
                int transactionCount = getCategoryTransactionCount(userEmail, category.getCategoryId(), month, year);
                row.createCell(3).setCellValue(transactionCount);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createBudgetVsActualSheet(Workbook workbook, String userEmail, int month, int year) {
        Sheet sheet = workbook.createSheet("Budget vs Actual");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle percentageStyle = createPercentageStyle(workbook);
        
        // Create headers
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Category", "Budget", "Actual", "Difference", "Utilization %"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // This would need budget data from your budget service
        // For now, we'll show actual expenses
        @SuppressWarnings("unchecked")
        List<Category> expenseCategories = ((List<Category>) categoryService.getCategories().getBody().getResponse())
                .stream()
                .filter(cat -> cat.getTransactionType().getTransactionTypeName().name().equalsIgnoreCase("Expense"))
                .collect(Collectors.toList());
        
        int rowNum = 1;
        for (Category category : expenseCategories) {
            if (category.isEnabled()) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(category.getCategoryName());
                
                // Budget (placeholder - you can integrate with your budget service)
                row.createCell(1).setCellValue("N/A");
                
                // Actual
                double actual = getCategoryTotal(userEmail, category.getCategoryId(), month, year);
                Cell actualCell = row.createCell(2);
                actualCell.setCellValue(actual);
                actualCell.setCellStyle(currencyStyle);
                
                // Difference
                row.createCell(3).setCellValue("N/A");
                
                // Utilization (placeholder)
                row.createCell(4).setCellValue("N/A");
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // Helper methods for data retrieval
    private double getTotalIncome(Long userId, int month, int year) {
        try {
            // Assuming transaction type 1 is Income
            Object result = reportService.getTotalByTransactionTypeAndUser(userId, 1, month, year)
                    .getBody().getResponse();
            if (result instanceof Number) {
                return ((Number) result).doubleValue();
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double getTotalExpenses(Long userId, int month, int year) {
        try {
            // Assuming transaction type 2 is Expense
            Object result = reportService.getTotalByTransactionTypeAndUser(userId, 2, month, year)
                    .getBody().getResponse();
            if (result instanceof Number) {
                return ((Number) result).doubleValue();
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    private int getTotalTransactionCount(Long userId, int month, int year) {
        try {
            Object result = reportService.getTotalNoOfTransactionsByUser(userId, month, year)
                    .getBody().getResponse();
            if (result instanceof Number) {
                return ((Number) result).intValue();
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private List<Transaction> getTransactionsForMonth(String userEmail, int month, int year) {
        try {
            @SuppressWarnings("unchecked")
            List<Transaction> transactions = (List<Transaction>) transactionService.getTransactionsByUser(userEmail, 0, 1000, "", "date", "desc", "")
                    .getBody().getResponse();
            return transactions != null ? transactions : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private double getCategoryTotal(String userEmail, int categoryId, int month, int year) {
        try {
            Object result = reportService.getTotalExpenseByCategoryAndUser(userEmail, categoryId, month, year)
                    .getBody().getResponse();
            if (result instanceof Number) {
                return ((Number) result).doubleValue();
            }
            return 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    private int getCategoryTransactionCount(String userEmail, int categoryId, int month, int year) {
        // This would need to be implemented in your transaction service
        // For now, returning a placeholder
        return 0;
    }

    private String getMonthName(int month) {
        String[] monthNames = {"", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};
        return monthNames[month];
    }

    // Style creation methods
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("\u20B9#,##0.00")); // INR currency format
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("mm/dd/yyyy"));
        return style;
    }

    private CellStyle createPercentageStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00%"));
        return style;
    }
}
