import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import './index.css';
import './theme.css';   // Custom theme
import App from './App.jsx';

// 2. Client ID
const GOOGLE_CLIENT_ID = "896564037694-mh8lmpvnnnlitp37hoin21i215e4jii7.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </GoogleOAuthProvider>
   </React.StrictMode>
);