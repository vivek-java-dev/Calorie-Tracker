import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/googleAuth';
import { loginWithGoogle } from '../services/authService';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const onGooglePress = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No idToken returned from Google');
      }

      const result = await loginWithGoogle(idToken);

      Alert.alert('Success', `Welcome ${result.user.name}`);
      console.log('JWT:', result.token);
    } catch (err: any) {
      console.error(err);
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