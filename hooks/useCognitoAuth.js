import { exchangeCodeAsync, makeRedirectUri, ResponseType, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import amplifyconfig from '../amplifyconfiguration.json';
import { useAuth } from '../components/AuthContext';
import { saveSessionFromExternalTokens } from '../services/cognito';

WebBrowser.maybeCompleteAuthSession();

const useCognitoAuth = () => {
  const { setAuth } = useAuth();
  
  // Automatically fetch endpoints from the issuer
  const discovery = useAutoDiscovery(`https://cognito-idp.${amplifyconfig.aws_project_region}.amazonaws.com/${amplifyconfig.aws_user_pools_id}`);

  const redirectUri = makeRedirectUri({
    scheme: 'psometric',
    path: 'auth'
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: amplifyconfig.aws_user_pools_web_client_id,
      scopes: ['openid', 'email', 'profile', 'phone'],
      redirectUri,
      responseType: ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      
      if (!discovery) return;

      exchangeCodeAsync(
        {
          clientId: amplifyconfig.aws_user_pools_web_client_id,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      ).then(async (tokenResult) => {
        console.log('✅ Token Exchange Success');
        const user = await saveSessionFromExternalTokens(tokenResult);
        setAuth(user);
      }).catch(err => {
        console.error('Token Exchange Failed', err);
        Alert.alert('Login Failed', 'Could not exchange token.');
      });
    } else if (response?.type === 'error') {
      Alert.alert('Login Error', response.error?.message || 'Something went wrong');
    }
  }, [response, discovery]);

  return {
    request,
    promptAsync,
    redirectUri
  };
};

export default useCognitoAuth;
