import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { GoogleSignin,isSuccessResponse } from '@react-native-google-signin/google-signin';
import { loginWithGoogle } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);



  const onGooglePress = async () => {
    try {
      setLoading(true);

      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      await GoogleSignin.signOut(); // 🔥 forces chooser
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In response:', JSON.stringify(userInfo, null, 2));

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        console.error('Full userInfo object:', JSON.stringify(userInfo, null, 2));
        throw new Error('No idToken returned from Google. Please check your Google Cloud Console configuration.');
      }

      console.log('idToken found:', idToken);

      const result = await loginWithGoogle(idToken);

      console.log('JWT:', result.token);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Login</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Sign in with Google" onPress={onGooglePress} />
      )}
    </View>
  );
};

export default LoginScreen;