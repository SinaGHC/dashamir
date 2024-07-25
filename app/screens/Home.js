import { FlatList, Pressable, StyleSheet, Platform } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Screen from "../components/Screen";
import { appAuth, db } from "../../firebase";
import {
  getDocs,
  collection,
  setDoc,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import NoteList from "../components/NoteList";
import Loading from "../components/Loading";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import Seperator from "../components/Seperator";

const Home = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const unsubscribeRef = useRef(null); // Reference to unsubscribe function

  useEffect(() => {
    getData();
    registerForPushNotificationsAsync();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = [];

      const lastMessagePromises = [];

      querySnapshot.forEach((doc) => {
        if (doc.data().UID !== appAuth.currentUser.uid) {
          userData.push({ id: doc.id, ...doc.data() });

          lastMessagePromises.push(getLastMessage(doc.data().UID));
        }
      });

      const lastMessages = await Promise.all(lastMessagePromises);

      userData.forEach((user, index) => {
        user.lastMessage = lastMessages[index];
      });

      setUsers(userData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
    } else {
      alert("Must use physical device for Push Notifications");
    }

    const tokenData = { pushToken: token.data };

    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc1) => {
      if (doc1.data().UID === appAuth.currentUser.uid) {
        setDoc(doc(db, "users", doc1.id), tokenData, { merge: true });
      }
      return token.data;
    });
  }
  const getLastMessage = async (user) => {
    try {
      const chatIds = [appAuth.currentUser.uid, user].sort();
      const chatId = chatIds.join("_");

      const chatRef = doc(db, "chats", chatId);
      const unsubscribe = onSnapshot(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const lastMessage = snapshot.data()?.lastMessage || "";
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) => {
              if (u.UID === user) {
                return { ...u, lastMessage };
              }
              return u;
            });
            return updatedUsers;
          });
        } else {
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) => {
              if (u.UID === user) {
                return { ...u, lastMessage: null };
              }
              return u;
            });
            return updatedUsers;
          });
        }
      });
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error("Error fetching last message:", error);
      return null;
    }
  };
  if (loading) {
    return <Loading flex={1} />;
  }
  return (
    <Screen style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("Chat", item)}>
            <NoteList
              title={item.FullName}
              imageUri={item.ProfileImage}
              subtitle={item.lastMessage}
            />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <Seperator />}
        refreshing={refreshing}
        onRefresh={getData}
      />
    </Screen>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
});
