import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal, FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import AnimatedInputOpt from '../../components/optionsTextInput';
import { useGlobalContext } from '../GlobalContext';
import colors from './../../constants/colors';
import { auth } from '../../../Firebase.config';
import { signOut } from 'firebase/auth';


const HomeScreen = () => {
  const [image, setImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pressedLanguage, setPressedLanguage] = useState(null);
  const { globalState, updateGlobalState, updateConnectedState } = useGlobalContext();
  const [isHe, setIsHe] = useState(globalState.gender !== 'he');  // Initialize based on globalState
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleLanguageSelect = (language) => {
    updateGlobalState({ language });
    setIsModalVisible(false);
  };

  const handleOutsideClick = () => {
    setIsModalVisible(false);
  };

  const logOut = () => {
    signOut(auth).then(() => {
      // Handle successful sign-out here
    }).catch((error) => {
      console.log(error);
    });
  };

  const handleGenderToggle = () => {
    setIsHe(!isHe);
    updateGlobalState({ gender: isHe ? 'he' : 'she' });  // Update globalState
    updateConnectedState({ otherGender: isHe ? 'he' : 'she' })
  };

  return (
    <View style={styles.externalContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.row}>
          <View>
            <AnimatedInputOpt
              value={globalState.name}
              onChange={(value) => updateGlobalState({ name: value })}
              placeholder="Name"
            />
            <TouchableOpacity
              onPress={handleGenderToggle}
              style={styles.sexPicker}
            >
              <Text style={[
                styles.text2,
                {borderRightWidth: 1, paddingRight: 4, paddingBottom: 4, borderColor: 'white'},
                {color: !isHe ? '#D9D9D9' : '#D9D9D970'}
              ]}>He</Text>
              <Text style={[
                styles.text2,
                {borderLeftWidth: 1, paddingLeft: 4, paddingBottom: 4, borderColor: 'white'},
                {color: isHe ? '#D9D9D9' : '#D9D9D970'}
              ]}>She</Text>
            </TouchableOpacity>
          </View>
          <Pressable
            onPress={() => pickImage()}
            style={({ pressed }) => [
              styles.profileImgContainer,
              { backgroundColor: pressed ? '#808080' : 'white' }
            ]}
          >
            {
              image === null ? 
              <Image
                source={require('../../../assets/iconEdit.png')}
                style={styles.imgEdit}
              /> : 
              <Image
                source={{ uri: image }}
                style={styles.imgProf}
              />
            }
          </Pressable>
        </View>
        <View style={styles.rowComp}>
          <Text style={styles.text}>Color</Text>
          <View style={styles.rowDots}>
            {['blue', 'red', 'green', 'yellow'].map(color => (
              <Pressable
                key={color}
                onPress={() => updateGlobalState({ sideTheme: color })}
                style={() => [
                  styles.dot,
                  { backgroundColor: globalState.sideTheme === color ? colors[color].normal : colors[color].faded }
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.rowComp}>
          <Pressable
            onPress={() => updateGlobalState({ volume: globalState.volume === '0' ? '100' : '0' })}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.text,
                  { color: pressed ? '#FFFFFF66' : '#FFFFFF' }
                ]}
              >
                Volume
              </Text>
            )}
          </Pressable>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={parseInt(globalState.volume)}
            onValueChange={(value) => updateGlobalState({ volume: value.toString() })}
            minimumTrackTintColor="white"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="white"
          />
        </View>
        <View style={styles.rowComp}>
          <Pressable onPress={() => setIsModalVisible(true)}>
            {({ pressed }) => (
              <Text
                style={[
                  styles.text,
                  { color: pressed ? '#FFFFFF66' : '#FFFFFF' }
                ]}
              >
                Language
              </Text>
            )}
          </Pressable>
          <Text style={styles.textLang}>{globalState.language}</Text>
        </View>
        <View style={styles.rowComp}>
          <Pressable
            onPress={() => logOut()}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.text,
                  { color: pressed ? '#FFFFFF66' : '#FFFFFF' }
                ]}
              >
                Log out
              </Text>
            )}
          </Pressable>
        </View>
      </View>
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={handleOutsideClick}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={['English', 'Spanish', 'French', 'German']}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.languageItem,
                      { backgroundColor: pressedLanguage === item ? '#ffffff66' : 'transparent' }
                    ]}
                    onPress={() => handleLanguageSelect(item)}
                    onPressIn={() => setPressedLanguage(item)}
                    onPressOut={() => setPressedLanguage(null)}
                  >
                    <Text style={styles.languageText}>{item}</Text>
                    {globalState.language === item ? <Text style={styles.languageTextSelect}> selected</Text> : null}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  externalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#313131',
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: 'black'
  },
  innerContainer: {
    flexGrow: 1,
    backgroundColor: '#404040',
    borderRadius: 20,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowComp: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 'auto',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  rowDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 10,
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
  textLang: {
    marginLeft: 'auto',
    color: '#FFFFFF66',
    fontSize: 20,
  },
  profileImgContainer:{
    marginLeft: 'auto',
    height: 110,
    width: 110, 
    borderRadius: 55,
    aspectRatio: 1,
    alignSelf: 'auto',
    backgroundColor: 'white',
    justifyContent: 'center',
    overflow: 'hidden', 
    alignItems: 'center', 
  },
  imgEdit: {
    height: 40,
    aspectRatio: 1,
    tintColor: '#313131',
    alignSelf: 'center',
  },
  imgProf: {
    height: '100%',
    width: '100%',
  },
  dot: {
    height: 15,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#00BFFF',
  },
  slider: {
    width: '50%',
    marginLeft: 'auto',
    marginRight: -15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  modalContent: {
    backgroundColor: '#404040',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
  languageItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageText: {
    color: 'white',
    fontSize: 18,
  },
  languageTextSelect: {
    color: 'green',
    fontSize: 18,
  },
  text2:{
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'moda',
    fontSize: 18,
  },
  sexPicker: {
    marginLeft: 20,
    marginTop: 10,
    flexDirection: 'row',
    right: 10,
  },
});

export default HomeScreen;
