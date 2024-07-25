import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  Image,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import Screen from "../components/Screen";
import colors from "../config/colors";
import AppTextInput from "../components/AppTextInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { appAuth, db } from "../../firebase";
import Loading from "../components/Loading";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Chat = ({ route }) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [visible, setVisivle] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    setVisivle(true);
    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), orderBy("timestamp", "asc")),
      (snapshot) => {
        const messages = [];
        snapshot.forEach((doc1) => {
          const data = doc1.data();
          if (
            (data.sender === appAuth.currentUser.uid &&
              data.receiver === route.params.UID) ||
            (data.sender === route.params.UID &&
              data.receiver === appAuth.currentUser.uid)
          ) {
            messages.push({
              id: doc1.id,
              sender: data.sender,
              message: data.message,
              seen: data.seen || false,
            });
            if (!data.seen && data.receiver === appAuth.currentUser.uid) {
              updateDoc(doc(db, "messages", doc1.id), {
                seen: true,
              });
            }
          }
        });
        setChatMessages(messages);
        setVisivle(false);
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    );

    return () => unsubscribe();
  }, [route.params.UID]);
  const updateChat = async (message) => {
    try {
      const chatIds = [appAuth.currentUser.uid, route.params.UID].sort();
      const chatId = chatIds.join("_");

      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        await updateDoc(chatRef, {
          lastMessage: message,
          lastMessageTimestamp: new Date().getTime(),
        });
      } else {
        await setDoc(chatRef, {
          users: chatIds,
          lastMessage: message,
          lastMessageTimestamp: new Date().getTime(),
        });
      }
    } catch (error) {
      console.error("Error updating chat document:", error);
    }
  };
  const getdata = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc1) => {
        if (
          doc1.data().UID === appAuth.currentUser.uid ||
          doc1.data().UID === route.params.UID
        ) {
          const dataToUpdate = {
            lastMessage: message,
          };
          setDoc(doc(db, "users", doc1.id), dataToUpdate, { merge: true });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleCopyMessage = async (message) => {
    try {
      await Clipboard.setStringAsync(message);
    } catch (error) {
      console.error("Error copying message to clipboard:", error);
    }
  };
  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "messages"), {
        sender: appAuth.currentUser.uid,
        receiver: route.params.UID,
        message: message,
        timestamp: new Date().getTime(),
        seen: false,
      });
      setMessage("");
      updateChat(message);
      setTimeout(() => {
        const unseenMessages = chatMessages.filter((message) => !message.seen);
        if (unseenMessages.length > 0) {
          const receiverPushToken = route.params.pushToken;
          const notificationMessage =
            "New message from " + appAuth.currentUser.email.split("@")[0];
          sendPushNotification(receiverPushToken, notificationMessage);
        }
      }, 5000);
      getdata();
    } catch (error) {
      console.log(error);
    }
  };
  async function sendPushNotification(expoPushToken, notificationMessage) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Message",
      body: notificationMessage,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }
  const renderItem = ({ item }) => (
    <Pressable onLongPress={() => handleCopyMessage(item.message)}>
      <View
        key={item.id}
        style={[
          styles.chatContainer,
          item.sender === appAuth.currentUser.uid
            ? styles.sentMessage
            : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        {item.sender === appAuth.currentUser.uid && (
          <MaterialCommunityIcons
            name={item.seen ? "check-bold" : "check"}
            color={item.seen ? "blue" : "black"}
          />
        )}
      </View>
    </Pressable>
  );
  if (visible) return <Loading width={200} height={200} />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Screen style={[styles.chat]}>
        <View style={styles.header}>
          <Image
            style={styles.image}
            source={{ uri: route.params.ProfileImage }}
          />
          <Text style={styles.headerText}>{route.params.FullName}</Text>
        </View>
        <FlatList
          scrollToEnd
          ref={flatListRef}
          data={chatMessages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 7 }}
        />
        <View style={styles.inputContainer}>
          <AppTextInput
            name="chat"
            placeholder="Type your message..."
            style={styles.textInput}
            onChangeText={(m) => setMessage(m)}
            value={message}
          />
          <Pressable style={styles.sendButton} onPress={handleSubmit}>
            <MaterialCommunityIcons name="rocket-launch" size={23} />
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chat: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatContainer: {
    maxWidth: "50%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: colors.LIGHT,
    height: 50,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
  },
  sentMessage: {
    backgroundColor: "#8d99ae",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#40A2E3",
    alignSelf: "flex-start",
  },
  messageText: {
    fontWeight: "700",
  },
  header: {
    backgroundColor: colors.LIGHT,
    height: 70,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    paddingLeft: 20,
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.LIGHT
  },
});
