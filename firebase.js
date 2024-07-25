import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZ3gmN0-VKRPZWY4L2eGfruM9F6llk4Bc",
  authDomain: "chatapp-cc04a.firebaseapp.com",
  projectId: "chatapp-cc04a",
  storageBucket: "chatapp-cc04a.appspot.com",
  messagingSenderId: "1027863985491",
  appId: "1:1027863985491:web:277e41c3c27b80d39975a6",
  measurementId: "G-TTMQQS8S8X",
};

const app = initializeApp(firebaseConfig);

export const appAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage();