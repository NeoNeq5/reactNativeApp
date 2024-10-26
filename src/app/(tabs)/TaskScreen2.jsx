import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, Button, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useGlobalContext } from '../GlobalContext'; // Adjust the path as needed
import TaskItem from '../../components/taskComp';
import TaskModal from '../../components/TaskModalComp';
import colors from './../../constants/colors';

const TaskScreen2 = () => {
  const { globalState, addTask, updateTask, deleteTask } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [whichTask, setWhichtask] = useState('');
  const [update, setUpdate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [stringdate, setStringDate] = useState(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [finishModeTaskIdYours, setFinishModeTaskIdYours] = useState(null);
  const [finishModeTaskIdOthers, setFinishModeTaskIdOthers] = useState(null);
  const [shownItems, setshownItems] = useState('');

  const getHighestTaskId = (list) => {
    return list.reduce((maxId, task) => Math.max(maxId, task.id), 0);
  };

  const manageTaskCreation = () => {
    setModalVisible(false);
    if (update) {
      updateTask({ ...selectedTask, title, message, expirationDate: stringdate }, whichTask);
    } else {
      const highestId = getHighestTaskId(globalState.tasks[whichTask]);
      const newId = highestId + 1;
      const newTask = {
        id: newId,
        title,
        message,
        expirationDate: stringdate,
        byWho: 'you',
        state: 'active',
      };
      addTask(newTask, whichTask);
    }
    clearInfo();
  };

  const clearInfo = () => {
    setTitle('');
    setMessage('');
    setSelectedTask(null);
    setUpdate(false);
    setDate(new Date());
    setStringDate(new Date().toISOString().split('T')[0]);
  };

  const onChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide date picker when date is selected
    if (selectedDate) {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setStringDate(currentDate.toISOString().split('T')[0]);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const deleteTaskHandler = (taskId, listIdentifier) => {
    deleteTask(taskId, listIdentifier);
    setFinishModeTaskIdYours(null);
    setFinishModeTaskIdOthers(null);
    setModalVisible(false);
    setUpdate(false);
  };

  const manageTaskState = (taskId, group, taskState) => {
    const task = globalState.tasks[group].find(t => t.id === taskId);
    if (task) {
      updateTask({ ...task, state: taskState }, group);
    }
    setFinishModeTaskIdYours(null);
    setFinishModeTaskIdOthers(null);
    if (modalVisible) {
      setModalVisible(false);
      setUpdate(false);
    }
  };

  const toggleModal = (prop) => {
    setWhichtask(prop);
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      setShowDatePicker(false);
    }
  };

  const toggleModalSecond = (prop, task) => {
    setTitle(task.title);
    setMessage(task.message);
    setStringDate(task.expirationDate.split('T')[0]); // Assuming expirationDate is in ISO format
    setWhichtask(prop);
    setUpdate(true);
    setSelectedTask(task);
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    if (!modalVisible) {
      setShowDatePicker(false); // Ensure date picker is hidden when modal is closed
    }
  }, [modalVisible]);

  const formatDate = (dateStr) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const date = new Date(dateStr);

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return 'Today';
    }

    if (
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()
    ) {
      return 'Tomorrow';
    }

    return dateStr.split('T')[0]; // Return the date in YYYY-MM-DD format
  };

  // Filter tasks based on shownItems
  const filterTasks = (tasks) => {
    if (shownItems === '') {
      return tasks.filter(task => task.state !== 'active');
    } else if (shownItems === 'deleted') {
      return tasks.filter(task => task.state === 'unfinished');
    } else if (shownItems === 'finished') {
      return tasks.filter(task => task.state === 'finished');
    }
    return tasks;
  };

  const sortedYourTasks = filterTasks(globalState.tasks.yours.slice().sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)));
  const sortedOthersTasks = filterTasks(globalState.tasks.others.slice().sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)));

  const handlePressOutside = (e) => {
    // Check if the click was outside the TaskItem area
    if (finishModeTaskIdYours || finishModeTaskIdOthers) {
      setFinishModeTaskIdYours(null);
      setFinishModeTaskIdOthers(null);
    }
  };

  const onShownItems = (color) => {
    if (color === 'red') {
      setshownItems(shownItems === 'deleted' ? '' : 'deleted');
    } else if (color === 'green') {
      setshownItems(shownItems === 'finished' ? '' : 'finished');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>TASKS HISTORY</Text>
          <View style={styles.rowDots}>
            {['red', 'green'].map(color => (
              <Pressable
                key={color}
                onPress={() => onShownItems(color)}
                style={({pressed}) => [
                  styles.dot,
                  { backgroundColor: pressed ? colors[color].normal : colors[color].faded}
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.columnContainer}>
            <Text style={styles.subHeaderText}>Your</Text>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.column}
            >
              {sortedYourTasks
              .map((task, index) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  previousTask={sortedYourTasks[index - 1]} 
                  toggleModalSecond={toggleModalSecond}
                  clearDeletionMode={handlePressOutside}
                  whichTask="yours"
                  formatDate={formatDate}
                  styles={styles}
                  setFinishModeTaskId={setFinishModeTaskIdYours}
                  finishModeTaskId={finishModeTaskIdYours}
                  onmanageTaskState={(taskId) => manageTaskState(taskId, 'yours', 'finished')}
                  setFinishModeTaskIdboth={() => {
                    setFinishModeTaskIdYours(null);
                    setFinishModeTaskIdOthers(null);
                  }}
                  isEditable={false}
                />
              ))}
            </ScrollView>
          </View>

          <Svg height="100%" width="4" style={styles.divider}>
            <Line
              x1="0"
              y1="0"
              x2="0"
              y2="95%"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="20, 15"
            />
          </Svg>

          <View style={styles.columnContainer}>
            <Text style={[styles.subHeaderText, {alignSelf: 'flex-end'}]}>{globalState.otherGender === 'he' ? 'His' : 'Hers'}</Text>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.column}
            >
              {sortedOthersTasks
              .map((task, index) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  previousTask={sortedOthersTasks[index - 1]} 
                  toggleModalSecond={toggleModalSecond}
                  clearDeletionMode={handlePressOutside}
                  whichTask="others"
                  formatDate={formatDate}
                  styles={styles}
                  setFinishModeTaskId={setFinishModeTaskIdOthers}
                  finishModeTaskId={finishModeTaskIdOthers}
                  onmanageTaskState={(taskId) => manageTaskState(taskId, 'others', 'finished')}
                  setFinishModeTaskIdboth={() => {
                    setFinishModeTaskIdYours(null);
                    setFinishModeTaskIdOthers(null);
                  }}
                  isEditable={false}
                />
              ))}
            </ScrollView>
          </View>
        </View>
        <TaskModal 
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          date={date}
          stringdate={stringdate}
          title={title}
          setTitle={setTitle}
          message={message}
          setMessage={setMessage}
          update={update}
          manageTaskCreation={manageTaskCreation}
          manageTaskState={manageTaskState}
          selectedTask={selectedTask}
          whichTask={whichTask}
          onChange={onChange}
          clearInfo={clearInfo}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313131',
    paddingTop: 15,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between text and dots
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center', // Center the text horizontally
    flex: 1, // Take up available space
  },
  dot: {
    height: 15,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#00BFFF',
  },
  rowDots: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align dots to the end
    gap: 10,
    right: 20,
  },
  subHeaderText: {
    color: '#fff',
    fontSize: 18,
    marginHorizontal: 30,
    marginVertical: 10,
    fontWeight: '300',
  },
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
    paddingHorizontal: 20,
  },
  columnContainer: {
    flex: 1,
  },
  divider: {
    marginTop: 20,
  },
  addTask: {
    alignSelf: 'center',
    backgroundColor: '#ccc',
    height: 50,
    aspectRatio: 1,
    margin: 20,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
  },
  imgPlus: {
    height: 35,
    aspectRatio: 1,
    tintColor: 'black',
    alignSelf: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#404040',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalButton: {
    backgroundColor: '#FF5C5C',
    padding: 10,
    margin: 'auto',
    borderRadius: 10,
  },
  modalContentContainer: {
    marginBottom: 5,
  },
  modalheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
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
  modalMessage: {
    borderTopWidth: 2,
    borderColor: '#D9D9D960',
    color: '#D9D9D9',
    fontSize: 18,
    minHeight: 0,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 10,
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
});

export default TaskScreen2;
