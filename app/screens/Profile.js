import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import Screen from "../components/Screen";
import { signOut } from "firebase/auth";
import { appAuth, storage } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";
import { pickImageAsync, uploadImage } from "../config/image";
import { ref, deleteObject } from "firebase/storage";

const Profile = () => {
  const [user, setUser] = useState({
    ProfileImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const getData = async () => {
    try {
      const cachedProfileImage = await AsyncStorage.getItem("profileImage");
      if (cachedProfileImage) {
        setUser({ ...user, ProfileImage: cachedProfileImage });
      } else {
        const querySnapshot = await getDocs(collection(db, "users"));
        for (const doc of querySnapshot.docs) {
          if (doc.data().UID === appAuth.currentUser.uid) {
            const { FullName, ProfileImage } = doc.data();
            setUser({ id: doc.id, FullName, ProfileImage });
            if (ProfileImage) {
              await AsyncStorage.setItem("profileImage", ProfileImage);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleImageChange = async () => {
    const pickedImage = await pickImageAsync();

    if (pickedImage !== null) {
      setIsAdding(true);

      if (user.ProfileImage) {
        const oldStorageRef = ref(storage, user.ProfileImage);
        await deleteObject(oldStorageRef);
      }
      const newProfileImage = await uploadImage(pickedImage);
      if (newProfileImage) {
        try {
          const usersCollectionRef = collection(db, "users");
          const q = query(
            usersCollectionRef,
            where("UID", "==", appAuth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { ProfileImage: newProfileImage });
          });

          setUser({ ...user, ProfileImage: newProfileImage });
          await AsyncStorage.setItem("profileImage", newProfileImage);
        } catch (error) {
          console.error("Error updating profile image:", error);
        }
      }
      setIsAdding(false);
    }
  };

  const handleDeleteImage = async () => {
    setDeleteLoading(true);
    try {
      if (user.ProfileImage) {
        const storageRef = ref(storage, user.ProfileImage);

        await deleteObject(storageRef);

        const usersCollectionRef = collection(db, "users");
        const q = query(
          usersCollectionRef,
          where("UID", "==", appAuth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { ProfileImage: null });
        });

        setUser({ ...user, ProfileImage: null });
        await AsyncStorage.removeItem("profileImage");
      }
    } catch (error) {
      console.error("Error deleting profile image:", error);
    }
    setDeleteLoading(false);
  };

  if (isLoading) {
    return <Loading width={200} height={200} flex={1} />;
  }

  return (
    <Screen style={styles.container}>
      <Pressable onPress={handleImageChange}>
        {user.ProfileImage ? (
          <>
            <Image source={{ uri: user.ProfileImage }} style={styles.image} />
            {deleteLoading && (
              <ActivityIndicator style={styles.loadingIndicator} />
            )}
            {isAdding && <ActivityIndicator style={styles.loadingIndicator} />}
          </>
        ) : (
          <MaterialCommunityIcons
            style={styles.icon}
            name="account"
            color={colors.LIGHT}
            size={120}
          />
        )}
      </Pressable>
      {user.ProfileImage && (
        <Pressable onPress={handleDeleteImage}>
          <Text style={styles.deleteText}>Delete Image</Text>
        </Pressable>
      )}
      <Pressable
        style={styles.btn}
        onPress={async () => {
          try {
            await signOut(appAuth);
            await AsyncStorage.removeItem("profileImage");
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <Text>Sign out</Text>
      </Pressable>
      <Text style={styles.bug}>Reporting Bug: @OGSNA</Text>
    </Screen>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 40,
    marginTop: 100,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  loadingIndicator: {
    position: "absolute",
    alignSelf: "center",
    marginTop: 50,
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.LIGHT,
    padding: 25,
    borderRadius: 15,
  },
  bug: {
    position: "absolute",
    bottom: 10,
    right: 10,
    color: colors.LIGHT,
  },
  deleteText: {
    color: "#40A2E3",
    alignSelf: "center",
    marginBottom: 40,
  },
});
