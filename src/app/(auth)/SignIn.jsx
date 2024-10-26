import { StyleSheet, Text, View, StatusBar, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedInput from '../../components/AnimatedTextInput';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importowanie funkcji Firestore
import { auth, db } from '../../../Firebase.config'; // Importowanie konfiguracji Firebase
import { useGlobalContext } from '../GlobalContext';


SplashScreen.preventAutoHideAsync();

const SignIn = () => {
  // hooks
  const { globalState } = useGlobalContext();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorAuth, setError] = useState(null); 
  const [loading, setLoading] = useState(false);

  // font
  const [loaded, error] = useFonts({
    'moda': require('./../../../assets/fonts/BodoniModaSC-VariableFont_opsz,wght.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);


  if (!loaded && !error) {
    return null;
  }

  const signInFirebase = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Ustawiamy domyślny stan, jeśli dokument nie istnieje
      await setDoc(userDocRef, {
        gender: 'he',
        otherGender: '',
        connectedId: '',
        name: '',
        nickName: '',
        sideTheme: 'blue',
        volume: '100',
        language: 'english',
        location: null,
        secondLocation: null,
        Mood: {
          actualMood: '',
          hourlyMood: Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '' })),
        },
        Mood2: {
          actualMood: '',
          hourlyMood: Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '' })),
        },
        tasks: {
          yours: [],
          others: [],
        },
        activities: {
          you: [],
          others: []
        }
      });
    }


      if (user.emailVerified) {
        if( globalState && globalState.connectedId === ''){
          router.replace('./ProfileConector');
        }
        else{
          router.replace('./../(tabs)/TaskScreen');
        }
      } else {
        setError('auth/email-not-verified');
        Alert.alert(
          "Verify your email",
          "send new verification email?",
          [
          {
            text: "send again",
            onPress: await sendEmailVerification(user)
          },
          {
            text: "cancel",
          }
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(error.code);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {

  };

  return (
    <View style={styles.container}> 
      <StatusBar barStyle="light-content" backgroundColor="#232323" />
      <View style={styles.upperContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Welcome back</Text>
          <Text style={styles.text}>We missed you</Text>
          <Text style={styles.text}>Let's sign you in</Text>
        </View>
        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <AnimatedInput value={email} onChange={setEmail} placeholder="Email" />
            <AnimatedInput value={password} onChange={setPassword} placeholder="Password" secureTextEntry={true}/>
          </View>
          {errorAuth && (
            <Text style={styles.error}>
              {errorAuth === 'auth/invalid-email' ? 'Invalid email' : 
               errorAuth === 'auth/user-disabled' ? 'User disabled' :
               errorAuth === 'auth/too-many-requests' ? 'To many requests' :
               errorAuth === 'auth/email-not-verified' ? 'email not verified' :
               errorAuth === 'auth/user-not-found' ? 'User not found' :
               errorAuth === 'auth/invalid-credential' ? 'Wrong email or password' :
               'Log in failed'}
            </Text>
          )}
          <Pressable 
            onPress={signInFirebase}
            style={({pressed}) => [
              styles.signInButton,
              { backgroundColor: pressed ? '#808080' : '#404040'}
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.text2}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.text1}>Or</Text>
        <Pressable 
          onPress={signInWithGoogle}
          style={({pressed}) => [
            styles.googleButton,
            { backgroundColor: pressed ? '#808080' : '#404040'}
          ]}
        >
          <Image 
            source={require('./../../../assets/iconGoogle.png')}
            style={styles.googleImg}
          />
        </Pressable>
        <Pressable 
          style={({pressed}) => 
            [
              {
                backgroundColor: pressed ? '#808080' : '#232323',
                paddingHorizontal: 15,
                marginHorizontal: 'auto',
                borderRadius: 15,
              }
            ]}
          onPress={() => router.push('/SignUp')}
        >      
          <Text style={styles.text2}>
            Don't have an account? Sign up
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default SignIn;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232323',
    flexGrow: 1,
  },
  inputsContainer: {
    padding: 20,
  },
  inputContainer: {
    gap: 30,
  },
  text: {
    color: 'white',
    fontFamily: 'moda',
    fontSize: 36,
    paddingBottom: 10,
    paddingTop: 10,
  },
  text1: {
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'moda',
    fontSize: 30,
    paddingBottom: 12,
  },
  text2: {
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'moda',
    fontSize: 18,
  },
  textContainer: {
    padding: 20,
  },
  googleButton: {
    padding: 5,
    borderRadius: 20,
    elevation: 5,
    height: 70,
    aspectRatio: 1,
    alignSelf: 'center',
    backgroundColor: '#404040',
  },
  signInButton: {
    marginTop: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    backgroundColor: '#404040',
  },
  googleImg: {
    flexShrink: 1,
    aspectRatio: 1,
  },
  upperContainer: {
    height: 550,
    justifyContent: 'space-between',
  },
  bottomContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  error: {
    color: 'red',
    fontFamily: 'moda',
    fontSize: 14,
  }
});
