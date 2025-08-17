import { Link, useNavigate } from "react-router-dom";
import success from '../../../assets/images/success.gif'

function RegistrationSuccess() {
    const navigate = useNavigate();

    return (

        <div className='container'>
            <div className="auth-form">
                <img src={success} alt="Success" className="success-icon"/>
                <h4 style={{textAlign:"center", color: "green"}}>Congratulations, You account has been successfully created!</h4>
                <br/>
                <Link to='/auth/login'><button className="button button-fill" style={{padding: '7px 25px'}}>Login now</button></Link>
            </div>
        </div>
    )
}
export default RegistrationSuccess;