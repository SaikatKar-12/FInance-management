import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

function TransactionTypeSelectWrapper({ transactionTypes, setTransactionType, activeTransactionType }) {
    const getTypeIcon = (typeName) => {
        switch(typeName.toLowerCase()) {
            case 'income':
                return <FaArrowDown className="icon" />;
            case 'expense':
                return <FaArrowUp className="icon" />;
            default:
                return null;
        }
    };

    return (
        <div className="transaction-type-selector">
            {transactionTypes.map((type) => (
                <div 
                    key={type.id}
                    className={`type-option ${activeTransactionType === type.id ? 'active' : ''}`}
                    onClick={() => setTransactionType(type.id)}
                >
                    <div className="type-icon">
                        {getTypeIcon(type.name)}
                    </div>
                    <span className="type-label">{type.name}</span>
                </div>
            ))}
        </div>
    );
}

export default TransactionTypeSelectWrapper;