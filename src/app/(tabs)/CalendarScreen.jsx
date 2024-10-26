import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, TextInput, ScrollView, Image, Modal } from 'react-native';
import moment from 'moment';
import { useGlobalContext } from '../GlobalContext';

const CalendarScreen = () => {
  const { globalState, addActivity, deleteActivity } = useGlobalContext();
  const [date, setDate] = useState(moment());
  const [activityMode, setActivityMode] = useState(false);
  const [firstDateMode, setFirstDateMode] = useState(false);
  const [secondDateMode, setSecondDateMode] = useState(false);
  const [beginningDate, setBeginningDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSelectingFirstDate, setIsSelectingFirstDate] = useState(false);
  const [isSelectingSecondDate, setIsSelectingSecondDate] = useState(false);
  const [activityMessage, setActivityMessage] = useState('');
  const [forWho, setForWho] = useState('you');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [modalMessageYou, setModalMessageYou] = useState('');
  const [modalMessageOther, setModalMessageOther] = useState('');
  const [modalDay, setModalDay] = useState('');
  const [isActivityLineYou, setIsActivityLineYou] = useState(false);
  const [isActivityLineOther, setIsActivityLineOther] = useState('');
  const [Error, setError] = useState(''); 
  const [activityYouId, setActivityYouId] = useState(null); 
  const [activityOtherId, setActivityOtherId] = useState(null); 
  const [NOfLines, setNOfLines] = useState({you: 1, other: 1}); 


  const generateMatrix = () => {
    const daysInMonth = date.daysInMonth(); // Number of days in the current month
    const firstDayOfMonth = moment(date).startOf('month').weekday(); // Day of the week the first day falls on
    const firstDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); // Adjust for Monday as the first day of the week
    const rows = Math.ceil((firstDay + daysInMonth) / 7); // Calculate the number of rows needed
  
    let day = 1;
    let matrix = [];
  
    // Loop through the number of rows
    for (let row = 0; row < rows; row++) {
      let week = [];
      // Loop through the number of columns (days of the week)
      for (let col = 0; col < 7; col++) {
        if ((row === 0 && col < firstDay) || day > daysInMonth) {
          week.push(null);  // Placeholder for days from adjacent months
        } else {
          week.push({ day, currentMonth: true, previousMonth: false, nextMonth: false }); // Day of the current month
          day++;
        }
      }
      matrix.push(week); 
    }
  
    // Handle leading days from the previous month
    if (matrix[0].some(day => day === null)) {
      const previousMonthDays = moment(date).subtract(1, 'months').daysInMonth();
      for (let col = 0; col < matrix[0].length; col++) {
        if (matrix[0][col] === null) {
          matrix[0][col] = { day: previousMonthDays - (firstDay - 1) + col, currentMonth: false, previousMonth: true, nextMonth: false  };
        }
      }
    }
  
    // Handle trailing days from the next month
    if (matrix[matrix.length - 1].some(day => day === null)) {
      let nextMonthDay = 1;
      for (let col = 0; col < matrix[matrix.length - 1].length; col++) {
        if (matrix[matrix.length - 1][col] === null) {
          matrix[matrix.length - 1][col] = { day: nextMonthDay++, currentMonth: false, previousMonth: false, nextMonth: true  };
        }
      }
    }
  
    return matrix; 
  };

  const changeMonth = (n) => {
    setDate(moment(date).add(n, 'months'));
  };

  const resetToCurrentMonth = () => {
    setDate(moment());
  };
  const checkForLines = (key) => {
    setNOfLines(prevState => ({
      ...prevState,
      [key]: prevState[key] === 1 ? 10 : 1
    }));
  };
  

  const handleDayPress = (selectedDay) => {
    const selectedDate = moment(date).date(selectedDay);
    const selectedType = forWho === 'you' ? 'you' : 'others';
    
    const isDayInRangeOfExistingActivity = (dateToCheck) => {
      return globalState.activities[selectedType].some((activity) => {
        const activityStart = moment(activity.startDate);
        const activityEnd = moment(activity.endDate);
  
        return dateToCheck.isBetween(activityStart, activityEnd, null, '[]');
      });
    };
  
    if (firstDateMode) {
      if (isDayInRangeOfExistingActivity(selectedDate)) {
        console.log(`Cannot select ${selectedDate.format('YYYY-MM-DD')} as it overlaps with an existing activity.`);
        return;
      }
  
      setBeginningDate(selectedDate);
      setFirstDateMode(false);
      setIsSelectingFirstDate(false);
      setSecondDateMode(true);
    } else if (secondDateMode) {
      if (!beginningDate) {
    
        console.log('Please set a start date first.');
        return;
      }
  
      if (selectedDate.isBefore(beginningDate)) {
        setBeginningDate(selectedDate);
        setEndDate(null);
        setSecondDateMode(true);
      } else {
        const isEndDateValid = !globalState.activities[selectedType].some((activity) => {
          const activityStart = moment(activity.startDate);
          const activityEnd = moment(activity.endDate);
  
          return beginningDate.isBefore(activityStart) && selectedDate.isSameOrAfter(activityStart);
        });
  
        if (!isEndDateValid) {
          console.log(`Cannot select ${selectedDate.format('YYYY-MM-DD')} as it overlaps with an existing activity.`);
          return;
        }
  
        setEndDate(selectedDate);
        setSecondDateMode(false);
        setIsSelectingSecondDate(false);
      }
    }
  };

  const handleDayPressModal = (event, dayObj, activityLines) => {
    if (activityMode === false) {
      const { pageX, pageY } = event.nativeEvent;
      setModalDay(dayObj.day);
      setModalPosition({ x: pageX, y: pageY });
  
      // Check if activityLines.you exists and is an array
      if (activityLines.you && Array.isArray(activityLines.you)) {
        const youActivity = activityLines.you.find(activity => activity?.days?.includes(dayObj.day));
  
        if (youActivity) {
          setIsActivityLineYou(true);
          setModalMessageYou(globalState.activities.you[activityLines.you.indexOf(youActivity)].title);
          setActivityYouId(youActivity.id);
        } else {
          setIsActivityLineYou(false);
        }
      }
  
      // Check if activityLines.others exists and is an array
      if (activityLines.others && Array.isArray(activityLines.others)) {
        const otherActivity = activityLines.others.find(activity => activity?.days?.includes(dayObj.day));
  
        if (otherActivity) {
          setIsActivityLineOther(true);
          setModalMessageOther(globalState.activities.others[activityLines.others.indexOf(otherActivity)].title);
          setActivityOtherId(otherActivity.id);
        } else {
          setIsActivityLineOther(false);
        }
      }
  
      setModalVisible(true);
    }
  };
  

  const closeModal = () => {
    setModalVisible(false); // Zamknij modal
  };

  const getActivityLines = () => {
    const activityLines = {
      currentMonth: { you: [], others: [] },
      previousMonth: { you: [], others: [] },
      nextMonth: { you: [], others: [] }
    };
    let taskIdYou = null;
    let taskIdOther = null;
  
    const addActivityLines = (startDate, endDate, type, activityIndex, targetMonth) => {
      let currentDate = moment(startDate);
      const activityDays1 = [];
      const activityDays2 = [];
      const activityDays3 = [];
      
  
      while (currentDate.isSameOrBefore(endDate)) {
        if (targetMonth === 'currentMonth' && currentDate.month() === date.month() && currentDate.year() === date.year()) {
          activityDays1.push(currentDate.date());
        } else if (targetMonth === 'previousMonth' && currentDate.month() === date.month() - 1 && currentDate.year() === date.year()) {
          if(currentDate.date() > 20){
            activityDays2.push(currentDate.date());
          }
        } else if (targetMonth === 'nextMonth' && currentDate.month() === date.month() + 1 && currentDate.year() === date.year()) {
          if(currentDate.date() <=7){
            activityDays3.push(currentDate.date());
          }
        }
        currentDate.add(1, 'day');
      }
  
      if (activityDays1.length > 0) {
        activityLines['currentMonth'][type][activityIndex] = { id: globalState.activities[type][activityIndex].id, days: activityDays1 };
      }
      if (activityDays2.length > 0) {
        activityLines['previousMonth'][type][activityIndex] = { id: globalState.activities[type][activityIndex].id, days: activityDays2 };
      }
      if (activityDays3.length > 0) {
        activityLines['nextMonth'][type][activityIndex] = { id: globalState.activities[type][activityIndex].id, days: activityDays3 };
      }

    };
  
  
    ['you', 'others'].forEach(type => {
      globalState.activities[type].forEach((activity, index) => {
        const activityStart = moment(activity.startDate);
        const activityEnd = moment(activity.endDate);
  
        if (
          activityStart.month() === date.month() || 
          activityEnd.month() === date.month() || 
          (activityStart.isBefore(date.startOf('month')) && activityEnd.isAfter(date.endOf('month')))
        ) {
          addActivityLines(activityStart, activityEnd, type, index, 'currentMonth');
        }
        
        if (
          activityStart.month() === date.month() - 1 || 
          activityEnd.month() === date.month() - 1 || 
          (activityStart.isBefore(moment(date).subtract(1, 'month').startOf('month')) && activityEnd.isAfter(moment(date).subtract(1, 'month').endOf('month')))
        ) {
          addActivityLines(activityStart, activityEnd, type, index, 'previousMonth');
        }
        
  
        if (
          activityStart.month() === date.month() + 1 || 
          activityEnd.month() === date.month() + 1 || 
          (activityStart.isBefore(moment(date).add(1, 'month').startOf('month')) && activityEnd.isAfter(moment(date).add(1, 'month').endOf('month')))
        ) {
          addActivityLines(activityStart, activityEnd, type, index, 'nextMonth');
        }
        
      });
    });
  
    console.log(JSON.stringify(activityLines)); 
    return activityLines;
  };
  
  const renderCalendar = () => {
    const matrix = generateMatrix();
    const activityLines = getActivityLines();
  
    const shouldHighlight = (dayObj, monthOffset) => {
      if (!dayObj) return false;
  
      const day = dayObj.day;
      const isCurrentMonth = dayObj.currentMonth;
      const currentDate = moment(date).date(day);
  
      if (isCurrentMonth) {
        return currentDate.isBetween(beginningDate, endDate, 'days', '[]');
      } else {
        const adjacentMonthDate = monthOffset === -1
          ? moment(date).subtract(1, 'months').date(day)
          : moment(date).add(1, 'months').date(day);
  
        return adjacentMonthDate.isBetween(beginningDate, endDate, 'days', '[]');
      }
    };

    const hasAdjacentActivity = (dayObj, direction, type, activityIndex, targetMonth) => {
      if (!dayObj) return false;
    
      const day = dayObj.day;
      let currentDate = moment(date).date(day);
      //change of the month for correctly changing day values from first day to last day
      if (targetMonth === 'previousMonth') {
        currentDate = currentDate.subtract(1, 'months');
      }
      if (targetMonth === 'nextMonth') {
        currentDate = currentDate.subtract(-1, 'months');
      }

      // Determine if the current date is the first or last date of the activity
      const isFirstDay = currentDate.isSame(moment(globalState.activities[type][activityIndex].startDate), 'day');
      const isLastDay = currentDate.isSame(moment(globalState.activities[type][activityIndex].endDate), 'day');



      const adjacentDate = moment(currentDate).add(direction, 'days');
    
    
      if (direction === -1 && isFirstDay) {
        return false;
      }
    
      
      if (direction === 1 && isLastDay) {
        return false;
      }
      
      const adjacentDay = adjacentDate.date();
      
      
      return (
        activityLines['currentMonth'][type][activityIndex]?.days.includes(adjacentDay) ||
        activityLines['nextMonth'][type][activityIndex]?.days.includes(adjacentDay) ||
        activityLines['previousMonth'][type][activityIndex]?.days.includes(adjacentDay)
      );
    };
    return matrix.map((week, rowIndex) => (
      <View key={rowIndex} style={styles.weekContainer}>
        <View style={styles.weekRow}>
          {week.map((dayObj, colIndex) => {
            const isCurrentMonth = dayObj && dayObj.currentMonth;
            const isNextMonth = dayObj && dayObj.nextMonth;
            const isPreviousMonth = dayObj && dayObj.previousMonth;
            const isHighlighted = shouldHighlight(dayObj);
  
              const targetMonth = isCurrentMonth 
            ? 'currentMonth' 
            : isNextMonth
            ? 'nextMonth' 
            : isPreviousMonth 
            ? 'previousMonth'
            : '';
            return (
              <View key={colIndex} style={{ flex: 1 }}>
                <Pressable
                  style={({pressed}) => [
                    styles.dayCell,
                    isCurrentMonth ? styles.dayCellFilled : styles.dayCellAdjacent,
                    isHighlighted ? (isCurrentMonth ? styles.dayCellSelected : styles.dayCellAdjacentHighlighted) : null,
                    isCurrentMonth ? {backgroundColor: pressed ? '#D9D9D950': '#D9D9D9'} : {backgroundColor: pressed ? '#D9D9D905': '#D9D9D930'}
                  ]}
                  onPress={(e) => 
                    {isCurrentMonth && handleDayPress(dayObj.day);
                      handleDayPressModal(e, dayObj, activityLines[targetMonth])
                    }
                  }
                >
                  <Text
                    style={[
                      styles.dayText,
                      isCurrentMonth ? styles.dayTextFilled : styles.dayTextAdjacent,
                    ]}
                  >
                    {dayObj ? dayObj.day : ''}
                  </Text>
                </Pressable>
                <View style={styles.activityLinesContainer}>
                  {activityLines[targetMonth].you.map((activity, index) => (
                    activity.days.includes(dayObj.day) && (
                      <View
                        key={`you-${index}`}
                        style={[
                          styles.activityLine,
                          styles.activityLineYou,
                          {
                            left: !hasAdjacentActivity(dayObj, -1, 'you', index, targetMonth) ? 4 : 0,
                            right: !hasAdjacentActivity(dayObj, 1, 'you', index, targetMonth) ? 4 : 0,
                            borderTopLeftRadius: !hasAdjacentActivity(dayObj, -1, 'you', index, targetMonth) ? 4 : 0,
                            borderBottomLeftRadius: !hasAdjacentActivity(dayObj, -1, 'you', index, targetMonth) ? 4 : 0,
                            borderTopRightRadius: !hasAdjacentActivity(dayObj, 1, 'you', index, targetMonth) ? 4 : 0,
                            borderBottomRightRadius: !hasAdjacentActivity(dayObj, 1, 'you', index, targetMonth) ? 4 : 0,
                          },
                        ]}
                      />
                    )
                  ))}
                  {activityLines[targetMonth].others.map((activity, index) => (
                    activity.days.includes(dayObj.day) && (
                      <View
                        key={`others-${index}`}
                        style={[
                          styles.activityLine,
                          styles.activityLineOthers,
                          {
                            left: !hasAdjacentActivity(dayObj, -1, 'others', index, targetMonth) ? 4 : 0,
                            right: !hasAdjacentActivity(dayObj, 1, 'others', index, targetMonth) ? 4 : 0,
                            borderTopLeftRadius: !hasAdjacentActivity(dayObj, -1, 'others', index, targetMonth) ? 4 : 0,
                            borderBottomLeftRadius: !hasAdjacentActivity(dayObj, -1, 'others', index, targetMonth) ? 4 : 0,
                            borderTopRightRadius: !hasAdjacentActivity(dayObj, 1, 'others', index, targetMonth) ? 4 : 0,
                            borderBottomRightRadius: !hasAdjacentActivity(dayObj, 1, 'others', index, targetMonth) ? 4 : 0,
                          },
                        ]}
                      />
                    )
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    ));
  };
  const discardActivity = () => {
    setActivityMode(false);
    setBeginningDate(null);  
    setEndDate(null);       
    setIsSelectingFirstDate(false); 
    setIsSelectingSecondDate(false);
    setError('');
  };

  const finishActivity = () => {
    if(beginningDate && endDate)
    {
      if(activityMessage){
          const newActivity = {
            startDate: beginningDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            title: activityMessage,
          };
          addActivity(newActivity, forWho === 'you' ? 'you' : 'others');
        setActivityMode(false);
        setBeginningDate(null);
        setEndDate(null);
        setActivityMessage('');
        setIsSelectingFirstDate(false);
        setIsSelectingSecondDate(false);
        console.log(globalState.activities);
        setError('')
      }
      else{
        setError('fill title input')
      }
    }
    else{
      setError('fill date inputs')
    }
    

  };
  const setActivityModeFun = () => {
    setActivityMode(true);
    setFirstDateMode(true);  
    setIsSelectingFirstDate(true);  
    setSecondDateMode(false);
    setIsSelectingSecondDate(false);
  };
  const setBegininigDate = () => {
    setFirstDateMode(true);
    setIsSelectingFirstDate(true); 
    setSecondDateMode(false);
    setIsSelectingSecondDate(false);
  };

  const setFinishDate = () => {
    setSecondDateMode(true);
    setFirstDateMode(false);
    setIsSelectingFirstDate(false);
    setIsSelectingSecondDate(true); 
  };

  const forWhoManage = () =>{
    if(forWho === 'you'){
      setForWho('other');
    }
    else if(forWho === 'other'){
      setForWho('you');
    }
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => changeMonth(-1)}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.monthTouchable}
          onPress={resetToCurrentMonth}>
          <Text style={styles.headerText}>{date.format('MMMM YYYY')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => changeMonth(1)}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        {renderCalendar()}
      </View>

      {activityMode === false ? 
        <TouchableOpacity 
          style={styles.newActivityButton}
          onPress={() => setActivityModeFun()}
        >
          <Text style={styles.newActivityText}>New activity</Text>
        </TouchableOpacity> 
      :
        <View style={styles.activityContainer}>
          <View style={styles.activityDateContainer}>
            <Pressable 
              onPress={setBegininigDate}
              style={[
                styles.dateButton,
                isSelectingFirstDate ? styles.dateButtonActive : null, 
              ]}
            >
              <Text style={styles.dateText}>
                {beginningDate ? beginningDate.format('DD MMM YYYY') : 'Set Start Date'}
              </Text>
            </Pressable>
            <Pressable 
              onPress={setFinishDate}
              style={[
                styles.dateButton,
                isSelectingSecondDate ? styles.dateButtonActive : null, 
              ]}
            >
              <Text style={styles.dateText}>
                {endDate ? endDate.format('DD MMM YYYY') : 'Set End Date'}
              </Text>
            </Pressable>
          </View>
          
          <TextInput
            style={styles.activityMessage}
            placeholder='Title'
            placeholderTextColor={'#ccc'}
            value={activityMessage} 
            onChangeText={setActivityMessage} 
          />
          {Error ? 
            <Text style={styles.error}>{Error}</Text>
            :
            <View/>
          }
          <View style={styles.activityButtonContainerOuter}>
            <TouchableOpacity 
              onPress={forWhoManage}
              style={styles.activityButtonForWho}>
              <Text style={styles.dateText}>
                for {forWho === 'you' ? 'you' : 'her'}
              </Text>
            </TouchableOpacity>
            <View style={styles.activityButtonContainer}>
              <TouchableOpacity 
                onPress={() => discardActivity()}
                style={styles.activityButton}>
                <Image
                  source={require('../../../assets/trash.png')}
                  style={styles.img}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => finishActivity()}
                style={styles.activityButton}>
                <Image
                  source={require('../../../assets/done.png')}
                  style={styles.img}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            setActivityYouId(null);
            setActivityOtherId(null);
            setNOfLines({you: 1 ,other: 1});
          }}
        >
          <View 
            style={[
              styles.modalContent, 
              { top: modalPosition.y - 80, left: modalPosition.x - 40  -modalPosition.x *0.28}
            ]}
          >
            <View style={styles.modalTitle}>
              <Text style={styles.modalTextTitle}>Activity for {modalDay}th day</Text>
            </View>
            <View style={styles.modalBody}>
              {isActivityLineOther || isActivityLineYou ? (
                <>
                  {isActivityLineYou && (
                    <View style={styles.modalActivityRow}>
                      <View
                        style={[
                          styles.modalLine,
                          { backgroundColor: '#007AFF' }
                        ]}
                      />
                      <TouchableOpacity 
                      onPress={() => checkForLines('you')}
                      >
                        <Text 
                          ellipsizeMode="tail"
                          numberOfLines={NOfLines.you}
                          style={styles.modalText}
                          >{modalMessageYou}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => {
                          deleteActivity(activityYouId, 'you');
                          setModalVisible(false);
                        }}
                      >
                      <Image
                        source={require('../../../assets/trash.png')}
                        style={styles.imgTrash}
                      />
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {isActivityLineOther && (
                    <View style={styles.modalActivityRow}>
                      <View
                        style={[
                          styles.modalLine,
                          { backgroundColor: '#FF9500' }
                        ]}
                      />
                      <TouchableOpacity 
                      onPress={() => checkForLines('other')}
                      >
                        <Text 
                          ellipsizeMode="tail"
                          numberOfLines={NOfLines.other} 
                          style={styles.modalText}
                          >{modalMessageOther}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => {
                        deleteActivity(activityOtherId,'others');
                        setModalVisible(false);
                      }}
                      >
                      <Image
                        source={require('../../../assets/trash.png')}
                        style={styles.imgTrash}
                      />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.modalActivityRow]}>
                  <Text style={styles.modalText}>no acitivities</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
  },
  navText: {
    color: '#ccc',
    fontSize: 24,
  },
  calendar: {
    backgroundColor: '#404040',
    padding: 15,
    paddingTop: 25,
    borderRadius: 10,
  },
  calendarButton:{
    width: 45,
    alignItems: 'center',
    borderRadius: 10,
  },
  monthTouchable: {
    paddingVertical: 5,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 0,
    justifyContent: 'center'
  },
  dayCell: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 34 / 2,
    height: 34,
    width: 34,
    margin: 2,
    padding: 'auto',
 },
  dayCellFilled: {
    backgroundColor: '#D9D9D9',
  },
  dayCellAdjacent: {
    backgroundColor: '#D9D9D930', 
  },
  dayCellSelected: {
    backgroundColor: '#007AFF', 
  },
  dayCellAdjacentHighlighted: {
    backgroundColor: '#007AFF40',
  },
  dayText: {
    fontSize: 16,
  },
  dayTextFilled: {
    color: 'black',
  },
  dayTextAdjacent: {
    color: 'black', 
  },
  newActivityButton: {
    marginTop: 20,
    backgroundColor: '#404040',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  newActivityText: {
    color: '#fff',
    fontSize: 18,
  },
  activityContainer: {
    marginTop: 20,
  },
  activityDateContainer: {
    justifyContent: "space-between",
    flexDirection: 'row',
  },
  dateButton: { 
    width: 150,
    height: 60,
    backgroundColor: '#404040',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#505050', 
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  activityMessage: {
    padding: 10,
    width: '100%',
    height: 60,
    backgroundColor: '#404040',
    borderRadius: 10,
    marginTop: 20,
    color: '#ccc',
  },
  activityButtonContainerOuter: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  activityButton: {
    backgroundColor: '#ccc',
    width: 50,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 30,
    height: 30,
  },
  activityButtonForWho: {
    backgroundColor: '#404040',
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityButtonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  weekContainer: {
    marginBottom: 10, 
  },
  activityLinesContainer: {
    paddingTop: 2,
    height: 12,
    flex:1,
    alignItems: 'center',
  },
  activityLine: {
    height: 3,  
 
 },
  activityLineYou: {
    backgroundColor: '#007AFF',
    position: 'absolute',
    bottom: 6,
  },
  activityLineOthers: {
    backgroundColor: '#FF9500', 
    position: 'absolute',
    bottom: 0,
  },
  outerdaycellcontainer: {
    marginHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#404040',
    borderRadius: 10,
    position: 'absolute',
  },
  modalText: {
    fontSize: 16,
    color: '#D9D9D9',
    width: 110,
  },
  modalTextTitle: {
    fontSize: 16,
    color: '#D9D9D9',
  },
  modalActivityRow: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden', 
  },
  modalLine: {
    width: 15,
    height: 2,
  },
  error: {
    color: 'red',
    fontSize: 14,
  },
  modalTitle: {
    padding: 10,
    backgroundColor: '#313131',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#c9c7b020',
  },
  modalBody: {
    padding: 10,
    gap: 10,
  },
  deleteButton: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  imgTrash: {
    width: 18,
    height: 18,
  },
});

export default CalendarScreen;