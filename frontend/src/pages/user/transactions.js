import { useCallback, useEffect, useState } from 'react';
import UserService from '../../services/userService';
import AuthService from '../../services/auth.service';
import Header from '../../components/utils/header';
import Message from '../../components/utils/message';
import Loading from '../../components/utils/loading';
import Search from '../../components/utils/search';
import usePagination from '../../hooks/usePagination';
import PageInfo from '../../components/utils/pageInfo';
import TransactionList from '../../components/userTransactions/transactionList.js';
import { useLocation } from 'react-router-dom';
import Info from '../../components/utils/Info.js';
import Container from '../../components/utils/Container.js';
import toast, { Toaster } from 'react-hot-toast';


function Transactions() {

    const [userTransactions, setUserTransactions] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [transactionType, setTransactionType] = useState('')
    const location = useLocation();

    const {
        pageSize, pageNumber, noOfPages, sortField, sortDirec, searchKey,
        onNextClick, onPrevClick, setNoOfPages, setNoOfRecords, setSearchKey, getPageInfo
    } = usePagination('date')

    const getTransactions = useCallback(async () => {
        try {
            const response = await UserService.get_transactions(
                AuthService.getCurrentUser().email, 
                pageNumber,
                pageSize, 
                searchKey, 
                sortField, 
                sortDirec, 
                transactionType
            );
            
            if (response.data.status === "SUCCESS") {
                setUserTransactions(response.data.response.data);
                setNoOfPages(response.data.response.totalNoOfPages);
                setNoOfRecords(response.data.response.totalNoOfRecords);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to fetch all transactions: Try again later!");
        } finally {
            setIsFetching(false);
        }
    }, [pageNumber, pageSize, searchKey, sortField, sortDirec, transactionType, setNoOfPages, setNoOfRecords]);

    useEffect(() => {
        getTransactions()
    }, [pageNumber, searchKey, transactionType, sortDirec, sortField, getTransactions])

    useEffect(() => {
        if (location.state?.text) {
            toast.success(location.state.text);
            // Clear the location state to prevent showing the message again on re-render
            window.history.replaceState({}, document.title);
        }
    }, [location.state])

    return (
        <Container activeNavId={1}>
            <Header title="Transactions History" />
            <Toaster/>

            {(userTransactions.length === 0 && isFetching) && <Loading />}
            {(!isFetching) &&
                <>
                    <div className='utils'>
                        <Filter
                            setTransactionType={(val) => setTransactionType(val)}
                        />
                        <div className='page'>
                            <Search
                                onChange={(val) => setSearchKey(val)}
                                placeholder="Search transactions"
                            />
                            <PageInfo
                                info={getPageInfo()}
                                onPrevClick={onPrevClick}
                                onNextClick={onNextClick}
                                pageNumber={pageNumber}
                                noOfPages={noOfPages}
                            />
                        </div>
                    </div>
                    {(userTransactions.length === 0) && <Info text={"No transactions found!"} />}
                    {(userTransactions.length !== 0) && <TransactionList list={userTransactions} />}
                </>
            }
        </Container>
    )
}

export default Transactions;


function Filter({ setTransactionType }) {
    return (
        <select onChange={(e) => setTransactionType(e.target.value)} style={{ margin: '0 15px 0 0' }}>
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
        </select>
    )
}


