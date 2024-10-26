import { useEffect, useState, createContext, useContext } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDoc } from 'firebase/firestore'; // Importujemy potrzebne funkcje z Firestore
import { auth, db } from '../../Firebase.config'; 
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';

const GlobalContext = createContext();

export const UserDataProvider = ({ children }) => {
  const defaultState = {
    gender: 'he',
    connectedId: '',
    name: '',
    nickName: '',
    sideTheme: 'blue',
    volume: '100',
    language: 'english',
    location: null,
    secondLocation: null,
    Mood: {
      actualMood: '',
      hourlyMood: Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '' })),
    },
    Mood2: {
      actualMood: '',
      hourlyMood: Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '' })),
    },
    tasks: {
      yours: [],
      others: [],
    },
    activities: {
      you: [],
      others: []
    }
  };

  const [globalState, setGlobalState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [lastCheckedHour, setLastCheckedHour] = useState(25); // Zmienna przechowująca ostatnią sprawdzoną godzinę

  const syncWithFirestore = async () => {
    if (!userId) return;

    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setGlobalState(docSnap.data());
    } else {
      await setDoc(docRef, defaultState);
      setGlobalState(defaultState);
    }
    setLoading(false);
  };

  const checkForId = async (connectID) => {
    if (!globalState || !globalState.tasks) {
      return; // Add this to avoid errors when globalState is null or tasks is undefined
    }
    // Check if the connectID document exists
    const connectIdDocRef = doc(db, 'users', connectID);
    const connectIdDocSnap = await getDoc(connectIdDocRef);
  
    if (connectIdDocSnap.exists()) {
      // Update the connectedId in the connectID document
      await updateDoc(connectIdDocRef, { connectedId: userId });
  
      // Update the connectedId in the current user's document
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { connectedId: connectID });
  
      return 'passed';
    } else {
      return 'Wrong Code';
    }
  };

  const listenToConnectedIdLocationChanges = () => {
    if (!globalState || !globalState.connectedId) return;

    const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
    const unsubscribe = onSnapshot(connectedUserDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const connectedUserData = docSnapshot.data();
        if (connectedUserData.location !== globalState.secondLocation) {
          updateGlobalState({ secondLocation: connectedUserData.location });
        }
      }
    });

    return unsubscribe;
  };

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
    if (userId) {
      syncWithFirestore();
      const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
          setGlobalState(doc.data());
        } else {
          console.log("No such document");
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribeConnectedId = listenToConnectedIdLocationChanges();
    
    return () => {
      if (unsubscribeConnectedId) {
        unsubscribeConnectedId();
      }
    };
  }, [globalState?.connectedId]);

  useEffect(() => {
    const intervalId = setInterval(checkTasksForUnfinished, 60000); // Sprawdzanie co minutę

    return () => clearInterval(intervalId); // Czyść interwał przy unmount
  }, [globalState]);

  // Dodajemy useEffect, aby sprawdzać czy godzina się zmieniła
  useEffect(() => {
    const checkHourChange = setInterval(() => {
      const currentHour = new Date().getHours();
      console.log("Hour changed, calling fillHourlyMood()");
      if (currentHour !== lastCheckedHour) {
        setLastCheckedHour(currentHour);
        console.log("Hour changed, calling fillHourlyMood()");
        fillHourlyMood(); // Wywołanie funkcji tylko, gdy zmieni się godzina
        fillHourlyMood2(); // Wywołanie funkcji tylko, gdy zmieni się godzina
      }
    }, 10000); // Sprawdzaj co 10 sekund
  
    return () => clearInterval(checkHourChange); // Czyszczenie interwału po unmount
  }, [lastCheckedHour]);

  

  const updateFirestore = async (updatedState) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId), updatedState);
    } catch (error) {
      console.error("Error updating Firestore: ", error);
    }
  };

  const updateGlobalState = (newValues) => {
    setGlobalState((prevState) => {
      const updatedState = {
        ...prevState,
        ...newValues,
      };
      updateFirestore(updatedState); // Aktualizowanie Firestore
      return updatedState;
    });
  };

  const updateConnectedState = async (newValues) => {
    if (!globalState || !globalState.connectedId) return;
    
    const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
    
    try {
      const connectedUserDocSnap = await getDoc(connectedUserDocRef);
      if (connectedUserDocSnap.exists()) {
        const connectedUserData = connectedUserDocSnap.data();
        const updatedConnectedState = {
          ...connectedUserData,
          ...newValues,
        };
        await setDoc(connectedUserDocRef, updatedConnectedState); // Aktualizowanie Firestore dla connectedId
      } else {
        console.error("Connected user document does not exist.");
      }
    } catch (error) {
      console.error("Error updating connected user's Firestore document: ", error);
    }
  };
  

  const addTask = async (task, type) => {
    if (!userId) return;
    
    try {
      // Pobierz aktualne dane użytkownika z Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
  
        // Dodaj zadanie do odpowiedniego typu (yours lub others)
        const highestId = userData.tasks[type].reduce((maxId, task) => Math.max(maxId, task.id), 0);
        const newTaskWithId = { ...task, id: highestId + 1 };
        const newTasks = [...userData.tasks[type], newTaskWithId].sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  
        // Zaktualizuj dokument użytkownika w Firestore
        const updatedState = {
          ...userData,
          tasks: {
            ...userData.tasks,
            [type]: newTasks,
          }
        };
        await setDoc(userDocRef, updatedState);
      }
  
      // Jeżeli dodajemy zadanie do others, zaktualizuj dokument connectedId
      if (type === 'others' && globalState.connectedId) {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
          const highestId = connectedUserData.tasks.yours.reduce((maxId, task) => Math.max(maxId, task.id), 0);
          const newTaskWithId = { ...task, id: highestId + 1 };
          const newTasks = [...connectedUserData.tasks.yours, newTaskWithId].sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            tasks: {
              ...connectedUserData.tasks,
              yours: newTasks,
            }
          };
          await setDoc(connectedUserDocRef, updatedConnectedUserState);
        }
      }
  
      // Jeżeli dodajemy zadanie do yours, zaktualizuj dokument connectedId
      if (type === 'yours' && globalState.connectedId) {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
          const highestId = connectedUserData.tasks.others.reduce((maxId, task) => Math.max(maxId, task.id), 0);
          const newTaskWithId = { ...task, id: highestId + 1 };
          const newTasks = [...connectedUserData.tasks.others, newTaskWithId].sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            tasks: {
              ...connectedUserData.tasks,
              others: newTasks,
            }
          };
          await setDoc(connectedUserDocRef, updatedConnectedUserState);
        }
      }
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };
  
  

  const updateTask = async (task, type) => {
    if (!globalState || !globalState.tasks) return;
    setGlobalState((prevState) => {
      const updatedTasks = prevState.tasks[type].map(t =>
        t.id === task.id ? { ...t, ...task } : t
      ).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
      const updatedState = {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [type]: updatedTasks,
        }
      };
      updateFirestore(updatedState);
      return updatedState;
    });
  
    // Aktualizowanie odpowiadającego zadania w connectedId
    if (globalState.connectedId) {
      try {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
  
          // Aktualizujemy odpowiadające zadanie w connectedId
          let updatedConnectedTasks = [];
          if (type === 'yours') {
            updatedConnectedTasks = connectedUserData.tasks.others.map(t =>
              t.id === task.id ? { ...t, ...task } : t
            ).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
          } else if (type === 'others') {
            updatedConnectedTasks = connectedUserData.tasks.yours.map(t =>
              t.id === task.id ? { ...t, ...task } : t
            ).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
          }
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            tasks: {
              ...connectedUserData.tasks,
              [type === 'yours' ? 'others' : 'yours']: updatedConnectedTasks,
            }
          };
          await setDoc(connectedUserDocRef, updatedConnectedUserState);
        } else {
          console.error("Connected user document does not exist.");
        }
      } catch (error) {
        console.error("Error updating connected user's Firestore document: ", error);
      }
    }
  };
  
  const deleteTask = (taskId, type) => {
    setGlobalState((prevState) => {
      const filteredTasks = prevState.tasks[type].filter(t => t.id !== taskId);
      const updatedState = {
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [type]: filteredTasks,
        }
      };
      updateFirestore(updatedState);
      return updatedState;
    });
  };
  
  const checkTasksForUnfinished = () => {
    const today = new Date().toISOString().split('T')[0]; // Pobiera dzisiejszą datę w formacie YYYY-MM-DD
    //console.log('check');
    setGlobalState((prevState) => {
      //console.log('check');
      const updatedTasks = {
        yours: prevState.tasks.yours.map(task => {
          if (task.state === 'active' && new Date(task.expirationDate).toISOString().split('T')[0] < today) {
            return { ...task, state: 'unfinished' }; // Zmieniamy state na `unfinished`
          }
          return task;
        }),
        others: prevState.tasks.others.map(task => {
          if (task.state === 'active' && new Date(task.expirationDate).toISOString().split('T')[0] < today) {
            return { ...task, state: 'unfinished' };
          }
          return task;
        })
      };

      const updatedState = {
        ...prevState,
        tasks: updatedTasks,
      };

      updateFirestore(updatedState); // Aktualizacja Firestore
      return updatedState;
    });
  };
  

  const addActivity = async (activity, type) => {
    if (!userId) return;
  
    try {
      // Dodawanie aktywności do bieżącego użytkownika
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const highestId = userData.activities[type].reduce((maxId, act) => Math.max(maxId, act.id || 0), 0);
        const newActivityWithId = { ...activity, id: highestId + 1 };
        const newActivities = [...userData.activities[type], newActivityWithId];
        const updatedState = {
          ...userData,
          activities: {
            ...userData.activities,
            [type]: newActivities,
          },
        };
  
        await setDoc(userDocRef, updatedState);
      }
  
      // Jeśli connectedId istnieje, dodaj aktywność odpowiednio do connectedId
      if (globalState.connectedId) {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
  
          let updatedConnectedActivities = [];
          if (type === 'you') {
            // Dodajemy aktywność do `others` w connectedId
            const highestConnectedId = connectedUserData.activities.others.reduce((maxId, act) => Math.max(maxId, act.id || 0), 0);
            const newConnectedActivityWithId = { ...activity, id: highestConnectedId + 1 };
            updatedConnectedActivities = [...connectedUserData.activities.others, newConnectedActivityWithId];
          } else if (type === 'others') {
            // Dodajemy aktywność do `you` w connectedId
            const highestConnectedId = connectedUserData.activities.you.reduce((maxId, act) => Math.max(maxId, act.id || 0), 0);
            const newConnectedActivityWithId = { ...activity, id: highestConnectedId + 1 };
            updatedConnectedActivities = [...connectedUserData.activities.you, newConnectedActivityWithId];
          }
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            activities: {
              ...connectedUserData.activities,
              [type === 'you' ? 'others' : 'you']: updatedConnectedActivities,
            },
          };
  
          await setDoc(connectedUserDocRef, updatedConnectedUserState);
        } else {
          console.error("Connected user document does not exist.");
        }
      }
    } catch (error) {
      console.error("Error adding activity: ", error);
    }
  };
  
  

  const deleteActivity = async (activityId, type) => {
    // Aktualizujemy stan bieżącego użytkownika
    setGlobalState((prevState) => {
      const filteredActivities = prevState.activities[type].filter(activity => activity.id !== activityId);
      const updatedState = {
        ...prevState,
        activities: {
          ...prevState.activities,
          [type]: filteredActivities,
        },
      };
      updateFirestore(updatedState);
      return updatedState;
    });
  
    // Usunięcie aktywności dla connectedId
    if (globalState.connectedId) {
      try {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
  
          // Jeśli usuwamy z 'you', usuwamy aktywność z 'others' u connectedId
          if (type === 'you') {
            const filteredConnectedActivities = connectedUserData.activities.others.filter(activity => activity.id !== activityId);
            const updatedConnectedState = {
              ...connectedUserData,
              activities: {
                ...connectedUserData.activities,
                others: filteredConnectedActivities,
              },
            };
            await setDoc(connectedUserDocRef, updatedConnectedState);
          }
  
          // Jeśli usuwamy z 'others', usuwamy aktywność z 'you' u connectedId
          if (type === 'others') {
            const filteredConnectedActivities = connectedUserData.activities.you.filter(activity => activity.id !== activityId);
            const updatedConnectedState = {
              ...connectedUserData,
              activities: {
                ...connectedUserData.activities,
                you: filteredConnectedActivities,
              },
            };
            await setDoc(connectedUserDocRef, updatedConnectedState);
          }
        }
      } catch (error) {
        console.error("Error updating connected user's Firestore document: ", error);
      }
    }
  };
  
  

  const updateHourlyMood = async (newMood) => {
    const currentHour = new Date().getHours();
    const currentDate = new Date().toISOString().split('T')[0];
  
    setGlobalState((prevState) => {
      const updatedHourlyMood = [...prevState.Mood.hourlyMood];
      updatedHourlyMood[currentHour] = { hour: currentHour, ...newMood, date: currentDate };
  
      const updatedState = {
        ...prevState,
        Mood: {
          ...prevState.Mood,
          actualMood: newMood.mood,
          hourlyMood: updatedHourlyMood,
        },
      };
      updateFirestore(updatedState); // Aktualizacja Firestore dla bieżącego użytkownika
  
      return updatedState;
    });
  
    // Aktualizowanie Mood2 w connectedId
    if (globalState.connectedId) {
      try {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
          const updatedConnectedHourlyMood2 = [...connectedUserData.Mood.hourlyMood];
          updatedConnectedHourlyMood2[currentHour] = { hour: currentHour, ...newMood, date: currentDate };
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            Mood2: {
              ...connectedUserData.Mood,
              actualMood: newMood.mood,
              hourlyMood: updatedConnectedHourlyMood2,
            },
          };
          await setDoc(connectedUserDocRef, updatedConnectedUserState); // Aktualizacja Firestore dla connectedId
        } else {
          console.error("Connected user document does not exist.");
        }
      } catch (error) {
        console.error("Error updating connected user's Firestore document: ", error);
      }
    }
  };
  
  const getLastKnownMood = () => {
    const { hourlyMood } = globalState.Mood;
    if(globalState){
      for (let i = hourlyMood.length - 1; i >= 0; i--) {
        if (hourlyMood[i].mood) {
          return hourlyMood[i];
        }
      }
    }
    return null;
  };

  const fillHourlyMood = async () => {
    const currentHour = new Date().getHours();
    const currentDate = new Date().toISOString().split('T')[0]; // Pobieramy aktualną datę
    const lastKnownMood = getLastKnownMood(); // Ostatnio znany mood
  
    setGlobalState((prevState) => {
      let updatedHourlyMood = [...prevState.Mood.hourlyMood];
      
      // Jeśli tablica hourlyMood zawiera dane z poprzedniego dnia, resetujemy ją
      const isSameDay = updatedHourlyMood.some(hourMood => hourMood.date === currentDate);
      if (!isSameDay) {
        // Resetujemy tablicę hourlyMood dla nowego dnia
        updatedHourlyMood = Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '', date: currentDate }));
      }
  
      // Wypełniamy godzinami do bieżącej godziny
      if (lastKnownMood) {
        const lastKnownHour = lastKnownMood.hour;
        const lastKnownDate = lastKnownMood.date;
  
        if (lastKnownDate !== currentDate) {
          // Nowy dzień - wypełniamy od godziny 0 do currentHour ostatnim znanym mood
          for (let i = 0; i <= currentHour; i++) {
            updatedHourlyMood[i] = { hour: i, mood: lastKnownMood.mood, message: lastKnownMood.message, date: currentDate };
          }
        } else {
          // Ten sam dzień - wypełniamy od lastKnownHour do currentHour
          for (let i = lastKnownHour + 1; i <= currentHour; i++) {
            updatedHourlyMood[i] = { hour: i, mood: lastKnownMood.mood, message: lastKnownMood.message, date: currentDate };
          }
        }
      }
  
      const updatedState = {
        ...prevState,
        Mood: {
          ...prevState.Mood,
          hourlyMood: updatedHourlyMood,
        },
      };
      
      updateFirestore(updatedState); // Aktualizacja Firestore dla bieżącego użytkownika
      return updatedState;
    });
  
    // Aktualizacja Mood2 w connectedId
    if (globalState.connectedId) {
      try {
        const connectedUserDocRef = doc(db, 'users', globalState.connectedId);
        const connectedUserDocSnap = await getDoc(connectedUserDocRef);
  
        if (connectedUserDocSnap.exists()) {
          const connectedUserData = connectedUserDocSnap.data();
          let updatedConnectedHourlyMood2 = [...connectedUserData.Mood2.hourlyMood];
  
          // Jeśli to nowy dzień, resetujemy także Mood2 w connectedId
          const isSameDayMood2 = updatedConnectedHourlyMood2.some(hourMood => hourMood.date === currentDate);
          if (!isSameDayMood2) {
            updatedConnectedHourlyMood2 = Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '', date: currentDate }));
          }
  
          if (lastKnownMood) {
            const lastKnownHour = lastKnownMood.hour;
            const lastKnownDate = lastKnownMood.date;
  
            if (lastKnownDate !== currentDate) {
              for (let i = 0; i <= currentHour; i++) {
                updatedConnectedHourlyMood2[i] = { hour: i, mood: lastKnownMood.mood, message: lastKnownMood.message, date: currentDate };
              }
            } else {
              for (let i = lastKnownHour + 1; i <= currentHour; i++) {
                updatedConnectedHourlyMood2[i] = { hour: i, mood: lastKnownMood.mood, message: lastKnownMood.message, date: currentDate };
              }
            }
          }
  
          const updatedConnectedUserState = {
            ...connectedUserData,
            Mood2: {
              ...connectedUserData.Mood2,
              hourlyMood: updatedConnectedHourlyMood2,
            },
          };
          
          await setDoc(connectedUserDocRef, updatedConnectedUserState); // Aktualizacja Firestore dla connectedId
        }
      } catch (error) {
        console.error("Error updating connected user's Firestore document: ", error);
      }
    }
  };
  const getLastKnownMood2 = () => {
    const { hourlyMood } = globalState.Mood2;
    if(globalState.Mood2){
      for (let i = hourlyMood.length - 1; i >= 0; i--) {
        if (hourlyMood[i].mood) {
          return hourlyMood[i];
        }
      }
    }
    return null;
  };

  const fillHourlyMood2 = async () => {
    const currentHour = new Date().getHours();
    const currentDate = new Date().toISOString().split('T')[0]; // Pobieramy aktualną datę
    const lastKnownMood2 = getLastKnownMood2(); // Ostatnio znany mood dla Mood2
  
    setGlobalState((prevState) => {
      let updatedHourlyMood2 = [...prevState.Mood2.hourlyMood];
      
      // Sprawdzamy, czy tablica hourlyMood2 zawiera dane z bieżącego dnia
      const isSameDay = updatedHourlyMood2.some(hourMood => hourMood.date === currentDate);
      
      // Jeśli dane są z poprzedniego dnia, resetujemy tablicę
      if (!isSameDay) {
        updatedHourlyMood2 = Array.from({ length: 24 }, (_, i) => ({ hour: i, mood: '', message: '', date: currentDate }));
      }
  
      // Wypełniamy godziny do bieżącej godziny
      if (lastKnownMood2) {
        const lastKnownHour = lastKnownMood2.hour;
        const lastKnownDate = lastKnownMood2.date;
  
        if (lastKnownDate !== currentDate) {
          // Nowy dzień - wypełniamy od godziny 0 do currentHour ostatnim znanym mood
          for (let i = 0; i <= currentHour; i++) {
            updatedHourlyMood2[i] = { hour: i, mood: lastKnownMood2.mood, message: lastKnownMood2.message, date: currentDate };
          }
        } else {
          // Ten sam dzień - wypełniamy od lastKnownHour do currentHour
          for (let i = lastKnownHour + 1; i <= currentHour; i++) {
            updatedHourlyMood2[i] = { hour: i, mood: lastKnownMood2.mood, message: lastKnownMood2.message, date: currentDate };
          }
        }
      }
  
      const updatedState = {
        ...prevState,
        Mood2: {
          ...prevState.Mood2,
          hourlyMood: updatedHourlyMood2,
        },
      };
  
      updateFirestore(updatedState); // Aktualizacja Firestore
      return updatedState;
    });
  };
  

  
  
  if (loading) {
    return (
    <View style={styles.activityIndicatorComp}>
      <StatusBar barStyle="light-content" backgroundColor="#232323" />
      <ActivityIndicator size='large' color='#D9D9D9'/>
    </View>
    );
  }

  return (
    <GlobalContext.Provider value={{ deleteActivity, checkForId, globalState, updateGlobalState, updateConnectedState, updateHourlyMood, fillHourlyMood, getLastKnownMood,fillHourlyMood2, getLastKnownMood2, addTask, updateTask, deleteTask, addActivity }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

const styles = StyleSheet.create({
  activityIndicatorComp:{
    backgroundColor: '#232323',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }

})