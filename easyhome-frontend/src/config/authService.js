import { UserManager } from 'oidc-client-ts';

// 1. Copiamos tu configuración exacta de main.jsx aquí
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_GBsGBTRls",
  client_id: "478qnp7vk39jamq13sl8k4sp7t",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid phone", 
};

export const userManager = new UserManager(cognitoAuthConfig);