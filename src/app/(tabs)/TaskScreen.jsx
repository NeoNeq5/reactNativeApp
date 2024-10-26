import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Modal, Button, StyleSheet, Image, Pressable, TouchableWithoutFeedback, TextInput } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useGlobalContext } from '../GlobalContext';// Adjust the path as needed
import TaskItem from '../../components/taskComp';
import TaskModal from '../../components/TaskModalComp';
import { parseISO, addDays, format } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../Firebase.config';

const TaskScreen = () => {
  const { globalState, addTask, updateTask, deleteTask } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [whichTask, setWhichtask] = useState('');
  const [update, setUpdate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [stringdate, setStringDate] = useState(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showeDateFrequecy, setShoweDateFrequecy] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [finishModeTaskIdYours, setFinishModeTaskIdYours] = useState(null);
  const [finishModeTaskIdOthers, setFinishModeTaskIdOthers] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [sortedYourTasks, setSortedYourTasks] = useState([]);
  const [sortedOthersTasks, setSortedOthersTasks] = useState([]);
  const [userId, setUserId] = useState(null);

  

  useEffect(() => {
    const sortTasks = () => {
      const yourTasks = globalState.tasks.yours.slice().sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
      const othersTasks = globalState.tasks.others.slice().sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      setSortedYourTasks(yourTasks);
      setSortedOthersTasks(othersTasks);
    };

    sortTasks();
  }, [globalState.tasks]);  // Monitorowanie zmian w globalState.tasks

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

  const getHighestTaskId = (list) => {
    return list.reduce((maxId, task) => Math.max(maxId, task.id), 0);
  };

  const manageTaskCreation = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    if (stringdate < today) {
      return;
    }

    setModalVisible(false);
    if (update) {
      updateTask({ ...selectedTask, title, message, expirationDate: stringdate, frequency: selectedDays }, whichTask);
    } else {
      const newTask = {
        title,
        message,
        expirationDate: stringdate,
        frequency: selectedDays,
        byWho: userId,
        state: 'active',
      };
      addTask(newTask, whichTask); // No need to manually set the ID here
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
    setSelectedDays([]);
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

  const getNextOccurrenceDate = (startDate, daysOfWeek) => {
    let nextDate = null;
    const today = new Date(startDate); // Start checking from the task's expiration date
    
    daysOfWeek.forEach(day => {
      const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
      if (dayIndex !== -1) {
        const targetDate = new Date(today);
        let daysToAdd = (dayIndex - today.getDay() + 7) % 7;
        
        // Skip today if it's the same day
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }
  
        targetDate.setDate(today.getDate() + daysToAdd);
  
        if (!nextDate || targetDate < nextDate) {
          nextDate = targetDate;
        }
      }
    });
  
    return nextDate;
  };
  
  const manageTaskState = (taskId, group, taskState) => {
    const taskList = globalState.tasks[group];
    const task = taskList.find(t => t.id === taskId);
  
    if (task) {
      // Check if the task state is not "deleted"
      if (taskState !== 'deleted' && task.frequency && task.frequency.length > 0) {
        // Calculate the next occurrence date from the task's current expiration date
        const taskExpirationDate = new Date(task.expirationDate);
        const nextOccurrenceDate = getNextOccurrenceDate(taskExpirationDate, task.frequency);
  
        // Create a new task with updated expiration date and keep the original task with updated state
        const updatedTask = { ...task, state: taskState };
        const newTask = {
          ...task,
          id: getHighestTaskId(taskList) + 1, // Generate a new ID for the duplicated task
          expirationDate: format(nextOccurrenceDate, 'yyyy-MM-dd'),
          state: 'active',
        };
  
        // Update the original task's state and add the new task
        updateTask(updatedTask, group);
        addTask(newTask, group);
      } else {
        // If no frequency or the state is "deleted", just update the state of the existing task
        updateTask({ ...task, state: taskState }, group);
      }
    }
  
    setFinishModeTaskIdYours(null);
    setFinishModeTaskIdOthers(null);
    if (modalVisible) {
      setModalVisible(false);
      setUpdate(false);
    }
  };

  const toggleModal = (prop) => {
    console.log(sortedYourTasks)
    setWhichtask(prop);
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      setShowDatePicker(false);
    }
  };

  const toggleModalSecond = (prop, task) => {
    setTitle(task.title);
    setMessage(task.message);
    setSelectedDays(task.frequency || []); // Set the selected days from the task's frequency
    setShoweDateFrequecy(task.frequency && task.frequency.length > 0); // Show the frequency picker if there are selected days
    setWhichtask(prop);
    setUpdate(true);
    console.log(task+task.id)
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

  const handlePressOutside = (e) => {
    // Check if the click was outside the TaskItem area
    if (finishModeTaskIdYours || finishModeTaskIdOthers) {
      setFinishModeTaskIdYours(null);
      setFinishModeTaskIdOthers(null);
    }
    setShoweDateFrequecy(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>TASKS</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.columnContainer}>
            <Text style={styles.subHeaderText}>Your</Text>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.column}
            >
              {sortedYourTasks
              .filter(task => task.state === 'active')
              .map((task, index) => (
                <TaskItem 
                  id={userId}
                  key={task.id} 
                  task={task} 
                  previousTask={sortedYourTasks.filter(task => task.state === 'active')[index - 1]} 
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
                  isEditable = {true}
                />
              ))}
              <Pressable 
                onPress={() => {
                  toggleModal('yours');
                  handlePressOutside();
                }} 
                style={({pressed}) => [
                  styles.addTask,
                  { backgroundColor: pressed ? '#404040' : '#D9D9D9' }
                ]}
              >
                <Image
                  source={require('../../../assets/plus.png')}
                  style={styles.imgPlus}
                />
              </Pressable>
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
              .filter(task => task.state === 'active')
              .map((task, index) => (
                <TaskItem 
                  id={userId}
                  key={task.id} 
                  task={task} 
                  previousTask={sortedOthersTasks.filter(task => task.state === 'active')[index - 1]} 
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
                  isEditable = {true}
                />
              ))}
              <Pressable
                onPress={() => {
                  toggleModal('others');
                  handlePressOutside();
                }} 
                style={({pressed}) => [
                  styles.addTask,
                  { backgroundColor: pressed ? '#404040' : '#D9D9D9' }
                ]}
              >
                <Image
                  source={require('../../../assets/plus.png')}
                  style={styles.imgPlus}
                />
              </Pressable>
            </ScrollView>
          </View>
        </View>
 
        <TaskModal 
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          showeDateFrequecy={showeDateFrequecy}
          setShoweDateFrequecy={setShoweDateFrequecy}
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
          setSelectedDays={setSelectedDays} // Pass function to set selected days
          selectedDays={selectedDays} // Pass function to set selected days
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
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: 'black'
  },
  header: {
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
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


export default TaskScreen;
