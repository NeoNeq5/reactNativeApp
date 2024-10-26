import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useGlobalContext } from '../app/GlobalContext';

const TaskItem = ({ id, task, previousTask, toggleModalSecond, clearDeletionMode, whichTask, formatDate, setFinishModeTaskId, finishModeTaskId, onmanageTaskState, setFinishModeTaskIdboth, isEditable }) => {
  const [finishMode, setFinishMode] = useState(false);
  const { globalState } = useGlobalContext();
  const isDifferentDate = !previousTask || task.expirationDate !== previousTask.expirationDate;

  useEffect(() => {
    setFinishMode(finishModeTaskId === task.id);
  }, [finishModeTaskId, task.id]);

  const handleLongPress = () => {
    setFinishMode(true);
    setFinishModeTaskId(task.id);
  };

  const handleDelete = () => {
    onmanageTaskState(task.id); // Notify the parent component to delete the task
    clearDeletionMode(); // Clear deletion mode after deletion
  };

  return (
    <View key={task.id}>
      {isDifferentDate && (
        <View style={styles.dateLane}>
          <Svg height="1" style={styles.divider1}>
            <Line
              x1="0"
              y1="0"
              x2="95%"
              y2="0"
              stroke="white"
              strokeWidth="2"
            />
          </Svg>
          <Text style={styles.dateDividerText}>{formatDate(task.expirationDate)}</Text>
          <Svg height="1" width="20%" style={styles.divider1}>
            <Line
              x1="0"
              y1="0"
              x2="95%"
              y2="0"
              stroke="white"
              strokeWidth="2"
            />
          </Svg>
        </View>
      )}
      <Pressable 
        onPress={() => {
          if(isEditable)
          if (finishMode) {
            handleDelete();
          } else {
            setFinishModeTaskIdboth();
            toggleModalSecond(whichTask, task);
          }
        }}
        onLongPress={() => {
          if(isEditable){
            handleLongPress()
          }
        }}
        style={({ pressed }) => [
          styles.task,
          finishMode && styles.deletionMode,
          { backgroundColor: 
            pressed && !finishMode ? '#808080' : 
            finishMode ? pressed ? '#32CD3290' : '#32CD3280' : '#D9D9D9' 
          },
          {
            borderColor:             
            task.state === 'finished' ? '#32CD3280' :
            task.state === 'unfinished' ? '#900029' :
            task.state === 'deleted' ? '#ff3100' :
            '#D9D9D9'
          },
          {
            borderWidth:
            task.state === 'finished' ? 3 :
            task.state === 'unfinished' ? 3 :
            task.state === 'deleted' ? 3 :
            0
          }
        ]}
      >
        {finishMode ? (
          <View style={styles.trashContainer}>
            <Image
              source={require('../../assets/done.png')}
              style={styles.imgTrash}
            />
          </View>
        ) : (
          <>
            <View style={styles.taskheader}>
              <Text ellipsizeMode='tail' style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskByWho}>by {task.byWho === id ? 'you' : globalState.otherGender === 'he' ? 'him' : 'her'}</Text>
            </View>
            <Text ellipsizeMode='tail' numberOfLines={3} style={styles.taskMessage}>{task.message}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  task: {
    alignSelf: 'center',
    backgroundColor: '#ccc',
    height: 120,
    aspectRatio: 1,
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth: 3,
  },
  taskheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskByWho: {
    fontWeight: '350',
  },
  taskTitle: {
    fontSize: 14,
    maxWidth: '50%',
    fontWeight: 'bold',
  },
  taskMessage: {
    fontSize: 15,
    color: '#333',
  },
  dateLane: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider1: {
    marginVertical: 10,
    width: '20%',
  },
  dateDividerText: {
    fontWeight: '350',
    color: '#D9D9D9',
  },
  trashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletionMode: {
    backgroundColor: '#FF6347',
  },
  imgTrash: {
    height: 45,
    aspectRatio: 1,
    tintColor: '#D9D9D9',
  },
});

export default TaskItem;
