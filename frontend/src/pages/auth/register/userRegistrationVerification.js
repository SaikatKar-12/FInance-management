import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {useForm} from 'react-hook-form';
import AuthService from '../../../services/auth.service';

const UserRegistrationVerfication = () => {
    const navigate = useNavigate();
    
    const { email } = useParams(); 

    const {register, handleSubmit, formState} = useForm();

    const [response_error, setResponseError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await AuthService.verifyRegistrationVerificationCode(data.code);
            if (response.data.status === "SUCCESS") {
                navigate('/auth/success-registration');
                setResponseError("");
            } else {
                setResponseError("Verification failed: Cannot resend email!");
            }
        } catch (error) {
            if (error.response) {
                const resMessage = error.response.data.response || "An error occurred during verification.";
                setResponseError(resMessage);
            } else {
                setResponseError("Verification failed: Cannot resend email!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resendCode = async () => {
        try {
            setIsSending(true);
            const response = await AuthService.resendRegistrationVerificationCode(email);
            console.log(response.data.message);
            setResponseError("");
        } catch (error) {
            console.error("Error resending verification code:", error);
            setResponseError("Cannot send email again!");
        } finally {
            setIsSending(false);
        }
    };

  return (
    <div className='container'>
            <form className="auth-form"  onSubmit={handleSubmit(onSubmit)}>
                <h2>Verify your email</h2><br/>
                {
                    isSending ? 
                        <div className='msg'>Sending email to {email}...</div> 
                        : (response_error==="") 
                        ? <div className='msg'>The verification code has been sent to <span style={{fontWeight:600,  color:'green'}}>{email}</span>.</div>
                        : <></>
                }
                {
                    (response_error!=="") && <p>{response_error}</p>
                }
                
                <div className='input-box'>
                    <input 
                    placeholder='Enter verification code'
                        type='text'
                        {...register('code', {
                            required: "Code is required!",
                        })}
                    />
                    {formState.errors.code && <small>{formState.errors.code.message}</small>}
                </div>

                <div className='msg' style={{fontWeight: 600, fontStyle: 'italic'}}>Please not that the verification code will be expired with in 15 minutes!</div>
                <br/>

                <div className='input-box'>
                    <input type='submit' value={isLoading ? "Verifying" : 'Verify'}
                     className={isLoading ? "button button-fill loading" : "button button-fill"}
                    />
                </div>

                <br/>
                <div className='msg'>Having problems? <span style={{cursor: 'pointer'}} onClick={resendCode} className='inline-link'>{isLoading ? "Sending code" : 'Resend code'}</span></div>
            </form>
    </div>
  );
};

export default UserRegistrationVerfication;
