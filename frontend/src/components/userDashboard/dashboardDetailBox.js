import '../../assets/styles/dashboard-cards.css';

function DashboardDetailBox({ total_income, total_expense, cash_in_hand, no_of_transactions }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className='details'>
            <Box 
                amount={formatCurrency(total_income)} 
                icon="📥"
                title="Income"
                prefix="Rs. "
                type="income"
            />
            <Box 
                amount={formatCurrency(total_expense)} 
                icon="📤"
                title="Expense"
                prefix="Rs. "
                type="expense"
            />
            <Box 
                amount={formatCurrency(cash_in_hand)} 
                icon="💰"
                title="Cash in Hand"
                prefix="Rs. "
                type="cash"
            />
            <Box 
                amount={no_of_transactions} 
                icon="🔄"
                title="Transactions"
                type="transaction"
            />
        </div>
    );
}

function Box({ amount, icon, title, prefix = '', type }) {
    return (
        <div className="dashboard-card">
            <div className="card-content">
                <div className={`card-icon ${type}`}>
                    <span className="emoji-icon">{icon}</span>
                </div>
                <div className="card-text">
                    <h2 className="card-amount">{prefix}{amount}</h2>
                    <h4 className="card-title">{title}</h4>
                </div>
            </div>
        </div>
    );
}

export default DashboardDetailBox;