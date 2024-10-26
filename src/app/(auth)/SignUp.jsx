import { StyleSheet, Text, View, StatusBar, Pressable, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import AnimatedInput from "../../components/AnimatedTextInput"
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../../../Firebase.config';



SplashScreen.preventAutoHideAsync();


const SignIn = () => {
  //hooks
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordRep, setPasswordRep] = useState('');
  const [email, setEmail] = useState('');
  const [errorAuth, setError] = useState(null); 
  const[loading, setLoading] = useState(false);
  const[isHe, setIsHe] = useState(false);

  //font
  
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

  //
  //auth
  const signUpFirebase = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert("Verify your email","Email verification link sent! Please verify your email before signing in."[
        {
          text: "send again",
          onPress: await sendEmailVerification(user)
        },
        {
          text: "ok",
        }
      ]);
      router.replace('/SignIn'); 
    } catch (error) {
      setError(error.code);
      console.log(error.code);
    } finally {
      setLoading(false);
    }
  }

  const passwordCheck = () => {
    if(password === passwordRep){
      signUpFirebase();
    }
    else{
      setError('auth/incorect-password');
    }
  }
  

  return (
    <View style={styles.container}> 
    <StatusBar barStyle="light-content" backgroundColor="#232323" />
      <View style={styles.upperContainer}>
        <View style={styles.textContainer}>
            <Text style={styles.text}>We're happy to heave you here</Text>
        </View>
        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <AnimatedInput value={email} onChange={setEmail} placeholder="Email" />
            <AnimatedInput value={password} onChange={setPassword} placeholder="Password" secureTextEntry={true}/>
            <AnimatedInput value={passwordRep} onChange={setPasswordRep} placeholder="Repeat password" secureTextEntry={true}/>
          </View>
          {errorAuth && (
              <Text style={styles.error}>
              {
              errorAuth === 'auth/invalid-email' ? 'Invalid email' : 
               errorAuth === 'auth/missing-password' ? 'Missing password' :
               errorAuth === 'auth/too-many-requests' ? 'To many requests' :
               errorAuth === 'auth/weak-password' ? 'Weak password' :
               errorAuth === 'auth/incorect-password' ? 'Different password' :
               errorAuth === 'auth/email-already-in-use' ? 'Email already in use' :
               'Sign up failed'
               }
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Pressable 
              onPress={passwordCheck}
              style={({pressed}) => [
                styles.signInButton,
                { backgroundColor: pressed ? '#808080' : '#404040'}
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.text2}>Sign up</Text>
              )}
            </Pressable>
            <TouchableOpacity 
              onPress={() => setIsHe(!isHe)}
              style={styles.sexPicker}
            >
              <Text style={[
                styles.text2,
                {borderRightWidth: 1, paddingRight: 4, paddingVertical: 5, borderColor: 'white'},
                {color: isHe ? '#D9D9D9' : '#D9D9D970'}
              ]}>He</Text>
              <Text style={[
                styles.text2,
                {borderLeftWidth: 1, paddingLeft: 4, paddingVertical: 5, borderColor: 'white'},
                {color: !isHe ? '#D9D9D9' : '#D9D9D970'}
              ]}>She</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.text1}>Or</Text>
        <Pressable 
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
        onPress={() => router.push('/SignIn')}>      

          <Text style = { styles.text2}>
              Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
      
    </View>
    
  )
}

export default SignIn

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232323',
    flexGrow: 1,
  },
  inputsContainer: {
    marginTop: -7,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  inputContainer: {
   gap: 30
  },
  text:{
    color: 'white',
    fontFamily: 'moda',
    fontSize: 36,
  },
  text1:{
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'moda',
    fontSize: 30,
    paddingBottom: 12,
  },
  text2:{
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'moda',
    fontSize: 18,
  },
  textContainer:{
    padding: 20,
  },
  googleButton:{
    padding: 5,
    borderRadius: 20,
    elevation: 5,
    height: 70,
    aspectRatio: 1,
    backgroundColor: 'white',
    alignSelf: 'center',
    backgroundColor: '#404040',
  },
  signInButton:{
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
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent:'center'
  },
  sexPicker: {
    flexDirection: 'row',
    position: 'absolute',
    right: 10,
  },
})