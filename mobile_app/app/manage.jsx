import React, { useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';

const BACKEND_URL = "http://10.0.2.2:3000";

const ManageReportsScreen = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (e) {
      console.error("Failed to get token:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert('Session expired', 'Please log in again');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/report`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          Alert.alert('Unauthorized', 'Session expired, please log in again.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error("Fetch reports error:", error);
        Alert.alert('Error', 'Failed to fetch reports');
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleEdit = (reportId) => {
    console.log("📝 Edit pressed for:", reportId);
    navigation.navigate('EditReport', { reportId });
  };

  const handleDelete = (reportId) => {
  console.log("🗑️ Delete pressed for:", reportId);

  const confirmDelete = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Platform.OS === 'web'
          ? alert('Unauthorized. Please log in again.')
          : Alert.alert('Unauthorized', 'Please log in again.');
        return;
      }

      const url = `${BACKEND_URL}/report/${reportId}`;
      console.log("📡 Sending DELETE to:", url);

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      console.log("📦 Response:", result);

      if (res.ok) {
        setReports(prev => prev.filter(report => report._id !== reportId));
        Platform.OS === 'web'
          ? alert('Report successfully deleted.')
          : Alert.alert('Deleted', 'Report successfully deleted.');
      } else {
        Platform.OS === 'web'
          ? alert(result.message || 'Delete failed')
          : Alert.alert('Delete Failed', result.message || 'Server error.');
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      Platform.OS === 'web'
        ? alert('Something went wrong.')
        : Alert.alert('Error', 'Something went wrong.');
    }
  };

  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to delete this report?')) {
      confirmDelete();
    }
  } else {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]
    );
  }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity
  onPress={() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('tabs'); // replace 'tabs' with your home screen if needed
    }
  }}
  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
>
  <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color="#1D3557" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Reports</Text>
        <View style={{ width: 20 }} />
      </View>
</TouchableOpacity>


      <ScrollView>
        {loading ? (
          <Text style={{ alignSelf: 'center', marginTop: 20 }}>Loading...</Text>
        ) : reports.length === 0 ? (
          <Text style={{ alignSelf: 'center', marginTop: 20 }}>No reports found.</Text>
        ) : (
          reports.map(report => (
            <View key={report._id} style={styles.reportRow}>
              <Text style={styles.reportText}>
                {report.itemDetails?.title || report._id}
              </Text>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => handleEdit(report._id)} style={styles.iconTouchable}>
                  <Icon name="pencil" size={22} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(report._id)} style={styles.iconTouchable}>
                  <Icon name="trash" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 40 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  header: {
      width: "100%",
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingHorizontal: 15,
    },
    backButton: {
      marginTop: 10,
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.header,
      textAlign: "center",
      flex: 1,
    },
  reportText: { flex: 1, fontSize: 16, marginRight: 10 },
  iconContainer: { flexDirection: 'row' },
  iconTouchable: { paddingHorizontal: 8 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  navIcon: { color: '#555' }
});

export default ManageReportsScreen;
