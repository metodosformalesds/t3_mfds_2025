import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/styles/index.css'
import './assets/styles/App.css'
import { AuthProvider } from "react-oidc-context";
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-config';

Amplify.configure(awsConfig);

// Configuración de OIDC usando variables de entorno
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_GBsGBTRls';
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '478qnp7vk39jamq13sl8k4sp7t';
const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const appUrl = window.location.origin; // Detecta automáticamente localhost o producción

// El dominio de Cognito (sin el guion bajo en el User Pool ID)
const cognitoDomain = `https://${userPoolId.toLowerCase().replace('_', '')}.auth.${region}.amazoncognito.com`;

const cognitoAuthConfig = {
  authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  client_id: clientId,
  redirect_uri: appUrl + "/",
  post_logout_redirect_uri: appUrl + "/",
  response_type: "code",
  scope: "email openid phone",
  // Configuración manual de todos los endpoints de Cognito
  metadata: {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    end_session_endpoint: `${cognitoDomain}/logout`,
    jwks_uri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)