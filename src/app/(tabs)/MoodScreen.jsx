import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native';
import colors from './../../constants/colors';
import { useGlobalContext } from '../GlobalContext';

const moods = {
  angry: colors.red.normal,
  sad: colors.blue.normal,
  happy: colors.green.normal,
  normal: colors.yellow.normal,
};

const HomeScreen = () => {
  const { globalState, updateHourlyMood, fillHourlyMood } = useGlobalContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMoodSelected, setmodalMoodSelected] = useState('');
  const [modalMoodMessage, setmodalMoodMessage] = useState('');
  const [selectedMoodDetails, setSelectedMoodDetails] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [NOfLines, setNOfLines] = useState({mood: 1}); 
  const tooltipRef = useRef(null);
  const moodRefs = useRef({});

  useEffect(() => {
    fillHourlyMood(); // Fill missing hours with the mood from the last known state
  }, []);

  const addMood = () => {
    setIsModalVisible(true);
  };

  const handleSaveMood = async () => {
    const newMood = { mood: modalMoodSelected, message: modalMoodMessage };
    if(modalMoodSelected){
      await updateHourlyMood(newMood); // Use global state update
      setIsModalVisible(false);
    }
  };

  const handleMoodPress = (moodData, event) => {
    const moodRef = moodRefs.current[moodData.hour];
    if (moodRef) {
      if(moodData){
        const { pageX, pageY } = event.nativeEvent;
        setModalPosition({ x: pageX, y: pageY });
        setSelectedMoodDetails(moodData);
      }
    }
  };


  const checkForLines = (key) => {
    setNOfLines(prevState => ({
      ...prevState,
      [key]: prevState[key] === 1 ? 10 : 1
    }));
  };

  const hourlyMoodArray = globalState?.Mood?.hourlyMood || [];

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>Your Current Mood</Text>
      <View style={styles.moodContainer}>
        <View
          style={[
            styles.actualMood,
            {
              backgroundColor:
                globalState.Mood.actualMood === 'happy'
                  ? colors.green.normal
                  : globalState.Mood.actualMood === 'sad'
                  ? colors.blue.normal
                  : globalState.Mood.actualMood === 'angry'
                  ? colors.red.normal
                  : globalState.Mood.actualMood === 'normal'
                  ? colors.yellow.normal
                  : '#D9D9D9',
            },
          ]}
        >
          {globalState.Mood.hourlyMood[new Date().getHours()].message === '' ? (
            <View></View>
          ) : (
            <View style={styles.messageMoodContainer}>
              {<Text style={styles.actualMoodText}>{globalState.Mood.hourlyMood[new Date().getHours()].message}</Text>}
            </View>
          )}
        </View>
        <View style={styles.hourlyMoodContainer}>
          {globalState.Mood.hourlyMood.map((moodData) => (
            <Pressable
              key={moodData.hour}
              ref={(ref) => (moodRefs.current[moodData.hour] = ref)}
              style={({ pressed }) => [
                styles.hourlyMood,
                { backgroundColor: moods[moodData.mood] || '#D9D9D9' },
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={(event) => handleMoodPress(moodData, event)}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#808080' : '#D9D9D9' },
          ]}
          onPress={() => addMood()}
        >
          <Image
            source={require('../../../assets/plus.png')}
            style={styles.imgPlus}
          />
        </Pressable>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.headerModal}>
                <Text style={styles.headerModalText}>How do you feel today?</Text>
              </View>
              <View style={styles.modalInnerContainer}>
                <View style={styles.modalMoodContainer}>
                  <View>
                    <Text style={styles.modalTopMoodText}>Happy</Text>
                    <Pressable
                      style={[
                        styles.modalMood,
                        {
                          backgroundColor:
                            modalMoodSelected === 'happy'
                              ? colors.green.faded
                              : colors.green.normal,
                        },
                      ]}
                      onPress={() => setmodalMoodSelected('happy')}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTopMoodText}>Sad</Text>
                    <Pressable
                      style={[
                        styles.modalMood,
                        {
                          backgroundColor:
                            modalMoodSelected === 'sad'
                              ? colors.blue.faded
                              : colors.blue.normal,
                        },
                      ]}
                      onPress={() => setmodalMoodSelected('sad')}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTopMoodText}>Angry</Text>
                    <Pressable
                      style={[
                        styles.modalMood,
                        {
                          backgroundColor:
                            modalMoodSelected === 'angry'
                              ? colors.red.faded
                              : colors.red.normal,
                        },
                      ]}
                      onPress={() => setmodalMoodSelected('angry')}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalTopMoodText}>Normal</Text>
                    <Pressable
                      style={[
                        styles.modalMood,
                        {
                          backgroundColor:
                            modalMoodSelected === 'normal'
                              ? colors.yellow.faded
                              : colors.yellow.normal,
                        },
                      ]}
                      onPress={() => setmodalMoodSelected('normal')}
                    />
                  </View>
                </View>
                <TextInput
                  placeholder='description'
                  value={modalMoodMessage}
                  style={styles.textInput}
                  onChangeText={setmodalMoodMessage}
                  placeholderTextColor='#D9D9D9'
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    { backgroundColor: pressed ? '#808080' : '#D9D9D9' },
                  ]}
                  onPress={() => handleSaveMood()}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        transparent={true}
        visible={!!selectedMoodDetails}
        animationType="fade"
        onRequestClose={() => setSelectedMoodDetails(null)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setSelectedMoodDetails(null);
            setNOfLines({mood: 1});
          }}
        >
          <View 
            style={[
              styles.modalTooltipContent, 
              { top: modalPosition.y - 80, left: modalPosition.x  -modalPosition.x *0.36}
            ]}
          >
            <View style={styles.modalTitle}>
              <Text style={styles.modalTextTitle}>Mood </Text>
                <Text style={styles.modalTextTitle}>{selectedMoodDetails?.hour}: </Text>
                <Text style={styles.modalTextTitle}>{selectedMoodDetails?.mood}</Text>
            </View>
            <View style={styles.modalBody}>
              <TouchableOpacity 
                onPress={() => checkForLines('mood')}
              >
                <Text 
                  ellipsizeMode="tail"
                  numberOfLines={NOfLines.mood} 
                  style={styles.modalText}
                >
                  {selectedMoodDetails?.message}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#313131',
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: 'black'
  },
  hourlyMoodContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: 248,
  },
  hourlyMood: {
    height: 25,
    width: 25,
    borderRadius: 10,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInnerContainer: {
    padding: 20,
  },
  actualMood: {
    width: 248,
    height: 400,
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    
  },
  actualMoodText: {
    padding: 10,
    fontWeight: '500',
  },
  headerModalText: {
    color: '#D9D9D9',
    fontSize: 18,
    padding: 10,
  },
  headerModal: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    backgroundColor: '#313131',
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#c9c7b020',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageMoodContainer: {
    paddingVertical: 10,
    borderTopWidth: 2,
    bordercolor: '#D9D9D9',
    width: 200,
  },
  moodContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    height: 50,
    width: 248,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    justifyContent: 'center',
  },
  topText: {
    color: '#D9D9D9',
    fontSize: 30,
    fontWeight: '300',
    alignSelf: 'center',
  },
  imgPlus: {
    height: 40,
    aspectRatio: 1,
    tintColor: 'black',
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  modalMoodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContent: {
    backgroundColor: '#404040',
    borderRadius: 10,
    width: '80%',
  },
  modalMood: {
    height: 40,
    aspectRatio: 1,
    borderRadius: 10,
    alignSelf: 'center',
  },
  textInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#313131',
    borderRadius: 10,
    marginTop: 20,
    color: '#D9D9D9',
    paddingHorizontal: 10,
  },
  modalTopMoodText: {
    fontSize: 14,
    color: '#D9D9D9',
    marginBottom: 5,
    alignSelf: 'center',
  },
  modalButton: {
    height: 40,
    width: '40%',
    alignSelf: 'center',
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#404040',
    borderRadius: 10,
    padding: 10,
    width: 'auto',
    maxWidth: 200,
    minWidth: 100,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#D9D9D9',
    fontSize: 14,
    textAlign: 'center',
  },
  moodMessageTop: {
    gap: 5,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalTooltipContent: {
    backgroundColor: '#404040',
    borderRadius: 10,
    position: 'absolute',
  },
  modalTitle: {
    padding: 10,
    backgroundColor: '#313131',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#c9c7b020',
    flexDirection: 'row',
    bottom: 0,
  },
  modalTextTitle: {
    fontSize: 16,
    color: '#D9D9D9',
  },
  modalBody: {
    padding: 10,
    gap: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#D9D9D9',
    width: 110,
  },
});

export default HomeScreen;
