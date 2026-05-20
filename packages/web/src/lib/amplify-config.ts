// ============================================================
// Amplify Configuration — Cognito + API Gateway
// ============================================================

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: { required: true },
        given_name: { required: true },
        family_name: { required: true },
        phone_number: { required: false },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      GolfConcierge: {
        endpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:4000/api',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    },
  },
};

// AppSync config for real-time subscriptions
export const appSyncConfig = {
  endpoint: import.meta.env.VITE_APPSYNC_ENDPOINT || '',
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  authenticationType: 'AMAZON_COGNITO_USER_POOLS' as const,
};
