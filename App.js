import "react-native-gesture-handler";
import React from "react";
import { StyleSheet } from "react-native";
import { appAuth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigation from "./app/navigation/TabNavigation";
import AuthNavigation from "./app/navigation/AuthNavigation";
import Loading from "./app/components/Loading";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(appAuth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
