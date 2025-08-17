import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import TransactionTypeSelectWrapper from './transactionTypeSelectWrapper';
import '../../assets/styles/transaction-form.css';
import '../../assets/styles/transaction-type-selector.css';

const transactionTypes = [
    { id: 1, name: 'Expense' },
    { id: 2, name: 'Income' }
];

function TransactionForm({ categories, onSubmit, isDeleting, isSaving, transaction, onDelete }) {
    // Form state
    const { register, handleSubmit, watch, reset, formState, setValue } = useForm();
    const [activeTransactionType, setActiveTransactionType] = useState(1); // Default to Income
    const [filteredCategories, setFilteredCategories] = useState([]);
    
    const date = useRef({});
    date.current = watch('date');
    const navigate = useNavigate();

    // Filter categories based on selected transaction type
    useEffect(() => {
        console.log('All categories:', categories);
        
        const filtered = categories.filter(cat => {
            console.log(`Category: ${cat.categoryName}, Type: ${cat.transactionType?.transactionTypeId}, Enabled: ${cat.enabled}`);
            return cat.enabled && cat.transactionType?.transactionTypeId === activeTransactionType;
        });
        
        console.log(`Filtered categories for type ${activeTransactionType}:`, filtered);
        setFilteredCategories(filtered);
        
        // Reset category selection when transaction type changes
        setValue('category', '');
    }, [activeTransactionType, categories, setValue]);

    // Set initial form values for edit mode
    useEffect(() => {
        if (transaction?.transactionId) {
            const typeId = transaction.transactionType?.transactionTypeId || 1; // Default to Income if not set
            setActiveTransactionType(typeId);
            
            reset({
                category: String(transaction.categoryId),
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date.split('T')[0]
            });
        } else {
            // Set default date for new transactions
            reset({
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [reset, transaction]);

    const deleteTransaction = (e, id) => {
        e.preventDefault()
        onDelete(id)
    }

    const cancelProcess = (e) => {
        e.preventDefault()
        navigate('/user/transactions')
    }


    return (
        <form className="transaction-form" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="form-title">
                {transaction?.transactionId ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            
            <div className="form-group">
                <label className="form-label">Transaction Type</label>
                <TransactionTypeSelectWrapper
                    transactionTypes={transactionTypes}
                    setTransactionType={setActiveTransactionType}
                    activeTransactionType={activeTransactionType}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">
                    {activeTransactionType === 1 ? 'Income' : 'Expense'} Category
                </label>
                {filteredCategories.length > 0 ? (
                    <div className="radio-group">
                        {filteredCategories.map((cat) => (
                            <div className="radio-option" key={cat.categoryId}>
                                <input
                                    type="radio"
                                    id={`${cat.categoryName}-${cat.categoryId}`}
                                    value={cat.categoryId}
                                    {...register('category', {
                                        required: "Please select a category"
                                    })}
                                />
                                <label htmlFor={`${cat.categoryName}-${cat.categoryId}`}>
                                    {cat.categoryName}
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-categories">
                        No {activeTransactionType === 1 ? 'income' : 'expense'} categories found.
                    </div>
                )}
                {formState.errors.category && (
                    <span className="error-message">{formState.errors.category.message}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <input
                    id="description"
                    type="text"
                    className="form-input"
                    placeholder="Enter transaction description"
                    {...register('description', {
                        maxLength: {
                            value: 50,
                            message: "Description can have at most 50 characters"
                        }
                    })}
                />
                {formState.errors.description && (
                    <span className="error-message">{formState.errors.description.message}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount (₹)</label>
                <input
                    id="amount"
                    type="text"
                    className="form-input"
                    placeholder="0.00"
                    {...register('amount', {
                        required: "Amount is required",
                        pattern: { 
                            value: /^\d+(\.\d{1,2})?$/, 
                            message: "Please enter a valid amount" 
                        }
                    })}
                />
                {formState.errors.amount && (
                    <span className="error-message">{formState.errors.amount.message}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input
                    id="date"
                    type="date"
                    className="form-input"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    {...register('date', {
                        required: "Date is required"
                    })}
                />
                {formState.errors.date && (
                    <span className="error-message">{formState.errors.date.message}</span>
                )}
            </div>

            <div className="form-actions">
                <button 
                    type="submit" 
                    className={`btn btn-primary ${isSaving ? 'btn-loading' : ''}`}
                    disabled={isSaving}
                >
                    <FaPlus className="icon" />
                    {transaction?.transactionId ? 'Update Transaction' : 'Add Transaction'}
                </button>
                
                {transaction?.transactionId && (
                    <button 
                        type="button"
                        className={`btn btn-danger ${isDeleting ? 'btn-loading' : ''}`}
                        onClick={(e) => deleteTransaction(e, transaction.transactionId)}
                        disabled={isDeleting}
                    >
                        <FaTrash className="icon" />
                        Delete
                    </button>
                )}
                
                <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={cancelProcess}
                >
                    <FaArrowLeft className="icon" />
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default TransactionForm;