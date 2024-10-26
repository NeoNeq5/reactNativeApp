import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import colors from './../../constants/colors';
import { useGlobalContext } from '../GlobalContext';

const moods = {
  angry: colors.red.normal,
  sad: colors.blue.normal,
  happy: colors.green.normal,
  normal: colors.yellow.normal,
};

const MoodScreen2 = () => {
  const { globalState, fillHourlyMood2 } = useGlobalContext();
  const [selectedMoodDetails, setSelectedMoodDetails] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [NOfLines, setNOfLines] = useState({mood: 1}); 
  const tooltipRef = useRef(null);
  const moodRefs = useRef({});

  useEffect(() => {
    fillHourlyMood2(); // Wypełnij brakujące godziny odpowiednim nastrojem z Mood2
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>{globalState.otherGender === 'he' ? 'His' : 'Hers'} Current Mood</Text>
      <View style={styles.moodContainer}>
        <View
          style={[
            styles.actualMood,
            {
              backgroundColor:
                globalState.Mood2.actualMood === 'happy'
                  ? colors.green.normal
                  : globalState.Mood2.actualMood === 'sad'
                  ? colors.blue.normal
                  : globalState.Mood2.actualMood === 'angry'
                  ? colors.red.normal
                  : globalState.Mood2.actualMood === 'normal'
                  ? colors.yellow.normal
                  : '#D9D9D9',
            },
          ]}
        >
          {globalState.Mood2.hourlyMood[new Date().getHours()].message === '' ? (
            <View></View>
          ) : (
            <View style={styles.messageMoodContainer}>
              {<Text style={styles.actualMoodText}>{globalState.Mood2.hourlyMood[new Date().getHours()].message}</Text>}
            </View>
          )}
        </View>
        <View style={styles.hourlyMoodContainer}>
          {globalState.Mood2.hourlyMood.map((moodData) => (
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
      </View>
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black',
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
  topText: {
    color: '#D9D9D9',
    fontSize: 30,
    fontWeight: '300',
    alignSelf: 'center',
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

export default MoodScreen2;
