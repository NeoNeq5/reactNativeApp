import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, TouchableWithoutFeedback, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../constants/colors';

const TaskModal = ({
  modalVisible,
  setModalVisible,
  showDatePicker,
  setShowDatePicker,
  showeDateFrequecy,
  setShoweDateFrequecy,
  date,
  stringdate,
  title,
  setTitle,
  message,
  setMessage,
  update,
  manageTaskCreation,
  manageTaskState,
  selectedTask,
  whichTask,
  onChange,
  clearInfo,
  setSelectedDays,
  selectedDays,
}) => {



  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const dateFrequencyManager = () => {
    setShoweDateFrequecy(!showeDateFrequecy);
  }

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(selectedDay => selectedDay !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddOrUpdateTask = () => {
    setSelectedDays(selectedDays); // Update the selected days before saving
    manageTaskCreation(); // Pass selected days when saving the task
    setShoweDateFrequecy(false);
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        setShowDatePicker(false);
      }}
    >
      <TouchableWithoutFeedback 
        onPress={() => {
          setModalVisible(false);
          setShowDatePicker(false);
          clearInfo();
        }}>
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalContainer}>
            <View style={styles.modalContentContainer}>
              <View style={styles.modalheader}>
                <TextInput
                  style={styles.modalTitle}
                  placeholder='Title'
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor={'#D9D9D9'}
                  multiline={true}
                  maxLength={20}
                />
                <Text style={styles.modalByWhoText}>By You</Text>
              </View>
              <View style={styles.topButtonContainer}>
                <Pressable 
                onPress={dateFrequencyManager}
                  style={({pressed}) => [
                    styles.datePicker,
                    { backgroundColor: pressed ? '#808080' : '#D9D9D9' }
                  ]}
                >
                  <Text>frequency</Text>
                </Pressable>
                <Pressable 
                  onPress={showDatepicker}
                  style={({pressed}) => [
                    styles.datePicker,
                    { backgroundColor: pressed ? '#808080' : '#D9D9D9' }
                  ]}
                >
                  <Text>{stringdate}</Text>
                </Pressable>
              </View>
              { showeDateFrequecy === true ?
                <View style={styles.pickDaysFrequencyContainer}>
                  {[['Monday', 'M'], ['Tuesday', 'T'], ['Wednesday', 'W'], ['Thursday', 'T'], ['Friday', 'F'], ['Saturday', 'S'], ['Sunday', 'S']].map(([day, dayL]) => (
                    <Pressable
                      key={day}
                      onPress={() => toggleDaySelection(day)} // Toggle selection on press
                      style={({ pressed }) => [
                        styles.weekDays,
                        {
                          backgroundColor: selectedDays.includes(day) ? colors.blue.normal : pressed ? colors.blue.normal : '#D9D9D9'
                        }
                      ]}
                    >
                      <Text>{dayL}</Text>
                    </Pressable>
                  ))}
                </View>
                :
                <View></View>
              }
 
              <TextInput
                style={styles.modalMessage}
                placeholder='message'
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={'#D9D9D9'}
                multiline={true}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              {update ? (
                <Pressable 
                  style={({pressed}) => [
                    styles.modalButton,
                    { backgroundColor: pressed ? '#808080' : '#D9D9D9' }
                  ]}
                  onPress={() => manageTaskState(selectedTask.id, whichTask, 'deleted')}
                >
                  <Image
                    source={require('../../assets/trash.png')}
                    style={styles.imgTrash}
                  />
                </Pressable>
              ) : <View/>}
              <Pressable 
                style={({pressed}) => [
                  styles.modalButton,
                  { backgroundColor: pressed ? '#808080' : '#D9D9D9' }
                ]}
                onPress={handleAddOrUpdateTask}
              >
                <Text>{update ? 'Update' : 'Add'}</Text>
              </Pressable>
            </View>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChange}
              style={styles.dateTimePicker}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#404040',
    borderRadius: 10,
    padding: 0,
    width: '80%',
  },
  modalButton: {
    backgroundColor: '#FF5C5C',
    padding: 10,
    margin: 'auto',
    borderRadius: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  modalContentContainer: {
    marginBottom: 5,
  },
  modalheader: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'flex-start',
    padding: 10,
    backgroundColor: '#313131',
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#c9c7b020',
  },
  haderRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  modalTitle: {
    color: '#D9D9D9',
    fontSize: 18,
    maxWidth: 100,
  },
  modalByWhoText: {
    color: '#D9D9D9',
    fontSize: 18,
  },
  modalMessage: {
    marginHorizontal: 20,
    color: '#D9D9D9',
    fontSize: 18,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderColor: '#D9D9D920'
  },
  datePicker: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
  },
  dateTimePicker: {
    width: '100%',
    backgroundColor: '#404040',
  },
  imgTrash: {
    height: 20,
    aspectRatio: 1,
  },
  topButtonContainer: {
    padding: 10,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  weekDays: {
    width: 24,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickDaysFrequencyContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 20,
    borderTopWidth: 2,
    borderColor: '#D9D9D920'
  },
});

export default TaskModal;
