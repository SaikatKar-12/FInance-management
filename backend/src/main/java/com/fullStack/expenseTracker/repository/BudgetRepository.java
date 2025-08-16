package com.fullStack.expenseTracker.repository;

import com.fullStack.expenseTracker.models.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Budget findByUserIdAndMonthAndYear(long userId, int month, long year);
}
//"token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWlrYXQ5OGthckBnbWFpbC5jb20iLCJpYXQiOjE3NTUxMDIzMDcsImV4cCI6MTc1NTE4ODcwN30.0gI5MYe7sfrLApU9eFAQZhT0qFQ8VomXxAuvfw9l2Ak",
