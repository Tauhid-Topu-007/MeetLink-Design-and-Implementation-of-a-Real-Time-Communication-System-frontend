import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the credential response
      const response = await axios.post('http://localhost:5000/api/auth/google-login', {
        token: credentialResponse.credential
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        toast.success('Google login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="filled_black"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;