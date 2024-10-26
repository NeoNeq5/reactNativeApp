import { StyleSheet, Text, View, StatusBar, Pressable, Image, Alert, TouchableOpacity, TextInput, ViewBase } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../Firebase.config'; 
import AnimatedInput from '../../components/AnimatedTextInput';
import { useGlobalContext } from '../GlobalContext';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const ProfileConector = () => {

  const { checkForId, globalState } = useGlobalContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isError, setIsError] = useState('');
  const [connectedUserId, setConnectedUserId] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if(globalState.connectedId !== ''){
      router.replace('./../(tabs)/TaskScreen');
    }
  }, []);
  // const [permission, requestPermission] = useCameraPermissions();

  // useEffect(() => {
  //   if (permission && !permission.granted) {
  //     requestPermission(); // Request permission only if it hasn't been granted yet
  //   }
  // }, [permission]);

  const connectToUser = async () => {
    setIsError('');
    if (userId !== connectedUserId && connectedUserId !== '') {
      const result = await checkForId(connectedUserId); // Czekamy na wynik funkcji
      if (result === 'Wrong Code') {
        setIsError('Wrong Code');
      } else if (result === 'passed' && globalState.connectedId !== '') {
        router.replace('./../(tabs)/TaskScreen');
      }
    } else {
      setIsError('Wrong Code');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#232323" />
      <View style={styles.textContainer}>
        <Text style={styles.text}>Let's connect your partner</Text>
      </View>
      {/* {isScanning ? (
        !permission ? (
          <Text style={styles.text2}>Requesting for camera permission...</Text>
        ) : !permission ? (
          <Text style={styles.text2}>No access to camera</Text>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
            facing="back"
              onBarCodeScanned={({data}) => {
                console.log("data", data)
              }}
              barcodeScannerSettings={{
              barCodeTypes: ["qr"],
              }}
              style={styles.cameraViewcomp}
            />
          </View>
        )
      ) : (
        <View style={styles.qrContainer}>
          <QRCode
            value="https://example.com"
            color="white"
            backgroundColor="#232323"
            size={220}
          />
          <TouchableOpacity style={styles.linkComp}>
            <Text style={styles.text2}>Code: </Text>
            <Image
              source={require('./../../../assets/copy.png')}
              style={styles.copyImg}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkComp}>
          <Text style={styles.text2}>Enter code: </Text>
            <TextInput 
              style={styles.TextInput}
            />
          </TouchableOpacity>
        </View>
      )} */}
      <View style={styles.qrContainer}>
          <TouchableOpacity style={styles.linkComp}>
            <Text style={styles.text2}>Your code: </Text>
            <TextInput 
              style={styles.TextInput}
              value={userId}
            />
            {/* <Image
              source={require('./../../../assets/copy.png')}
              style={styles.copyImg}
            /> */}
          </TouchableOpacity>
            <TouchableOpacity style={styles.linkComp}>
              <Text style={styles.text2}>Connect to: </Text>
              <TextInput 
                style={styles.TextInput}
                value={connectedUserId}
                onChangeText={setConnectedUserId}
              />
            </TouchableOpacity>
            {isError && (
            <Text style={styles.error}>
              {isError}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => connectToUser()}
            >
            <Text style={styles.text2}>Connect</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

export default ProfileConector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#232323',
    flexGrow: 1,
  },
  qrContainer: {
    padding: 30,
  },
  text: {
    color: 'white',
    fontFamily: 'moda',
    fontSize: 36,
    paddingBottom: 10,
    paddingTop: 10,
  },
  text2: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: '300',
    fontFamily: 'moda',
  },
  textContainer: {
    padding: 20,
  },
  linkComp: {
    backgroundColor: '#404040',
    width: '100%',
    marginTop: 40,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyImg: {
    width: 30,
    height: 30,
  },
  cameraImg: {
    width: 30,
    height: 30,
  },
  bottomButtonsContainer: {
    margin: 30,
    marginTop: 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  bottomButton: {
    backgroundColor: '#404040',
    width: 50,
    aspectRatio: 1,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    borderRadius: 20, // Adjust the border radius as needed
    overflow: 'hidden',
    height: '60%', // Set a height for the CameraView
    width: '80%', // Adjust width as needed
    alignSelf: 'center',
    
  },
  cameraViewcomp:{
    flex:1,
  },
  TextInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '200',
    bottom: -3,
  },
  connectContainer: {
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#404040',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    alignSelf: 'center',
  },
  error: {
    color: 'red',
    fontFamily: 'moda',
    fontSize: 14,
    alignSelf: 'flex-start',
  },
});
