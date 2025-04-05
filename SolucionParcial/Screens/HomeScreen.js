import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { loadTasks, saveTasks } from '../../utils/storage';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasks();
      setTasks(storedTasks);
    };
    const unsubscribe = navigation.addListener('focus', fetchTasks);
    return unsubscribe;
  }, [navigation]);

  const toggleComplete = async (id) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const deleteTask = async (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = tasks.filter(task => task.id !== id);
          setTasks(updated);
          await saveTasks(updated);
        }
      }
    ]);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const renderItem = ({ item }) => (
    <View style={styles.task}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <Text style={[styles.taskText, item.completed && styles.completed]}>
          ✅ {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.delete}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 My Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      <Button title="Logout" color="red" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginVertical: 5,
  },
  taskText: { fontSize: 16 },
  completed: { textDecorationLine: 'line-through', color: 'gray' },
  delete: { color: 'red', fontWeight: 'bold', fontSize: 18 },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
