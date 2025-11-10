const awsConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_ItW1vsaku',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '5e9mcjnob4qgslvmc3kqtcd5p2',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    }
  },
  API: {
    REST: {
      'easyhome-api': {
        endpoint: import.meta.env.VITE_API_URL || 'https://tu-api-gateway.execute-api.us-east-1.amazonaws.com/dev',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      }
    }
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET_USER_CONTENT || 'easyhome-user-content',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    }
  }
};

export default awsConfig;