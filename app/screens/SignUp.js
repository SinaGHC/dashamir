import { Formik } from "formik";
import * as Yup from "yup";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppTextInput from "../components/AppTextInput";
import Screen from "../components/Screen";
import colors from "../config/colors";
import logo from "../assets/logo.png";
import { appAuth, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must at least be 4 characters"),
  fullName: Yup.string().required("Full name is required"),
});

const SignUp = ({ navigation }) => {
  const [visible, setVisivle] = useState(false);
  const [image, setImage] = useState(null);
  const [downloadedimage, setDownloadedImage] = useState(null);

  const initialValues = {
    email: "",
    password: "",
    fullName: "",
  };
  useEffect(() => {
    if (image) {
      uploadImage();
    }
  }, [image]);
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async (values) => {
    setVisivle(true);
    const { email, password, fullName } = values;
    try {
      if (image) {
        await uploadImage();
      }
      const userCredential = await createUserWithEmailAndPassword(
        appAuth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      const docRef = await addDoc(collection(db, "users"), {
        Email: email,
        Password: password,
        FullName: fullName,
        UID: uid,
        ProfileImage: downloadedimage || "",
      });
      setVisivle(false);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Email Already Exists",
          "Please try again with a different email.",
          ["Ok"]
        );
      }
      setVisivle(false);
      console.log(error);
    }
  };
  const uploadImage = async () => {
    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      if (!uri) {
        console.error("URI is null");
        return;
      }
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request fails"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      const filename = image.substring(image.lastIndexOf("/") + 1);
      const storageRef = ref(storage, filename);
      uploadBytes(storageRef, blob).then(async (snapshot) => {
        console.log("Uploaded a blob or file!");
        const downloadURL = await getDownloadURL(snapshot.ref);
        setDownloadedImage(downloadURL);
      });
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.iiContainer}>
        {image ? (
          <Image style={styles.image} source={{ uri: image }} />
        ) : (
          <Image style={styles.image} source={logo} />
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <AppTextInput
                placeholder="Email"
                style={styles.input}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email && touched.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}
              <AppTextInput
                name="account-lock"
                placeholder="Password"
                style={styles.input}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                secureTextEntry
              />
              {errors.password && touched.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}
              <AppTextInput
                placeholder="Full Name"
                style={styles.input}
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                value={values.fullName}
                autoCapitalize="words"
              />
              {errors.fullName && touched.fullName && (
                <Text style={styles.error}>{errors.fullName}</Text>
              )}
              <Pressable style={styles.imagePicker} onPress={pickImageAsync}>
                <MaterialCommunityIcons
                  style={styles.icon}
                  name="camera"
                  size={27}
                  color={colors.DARK}
                />
                <Text style={styles.pickerText}>Select an image</Text>
              </Pressable>

              <Pressable style={styles.btn} onPress={handleSubmit}>
                <Text style={styles.text}>Submit</Text>
              </Pressable>
            </>
          )}
        </Formik>
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomText}>Have an account?</Text>
          <Pressable
            disabled={visible}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.bottomText, styles.link]}> Login</Text>
          </Pressable>
        </View>
        {visible && <ActivityIndicator />}
      </View>
    </Screen>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.DARK,
    flex: 1,
    paddingHorizontal: 20,
  },
  image: {
    alignSelf: "center",
    width: 80,
    height: 80,
    marginBottom: 40,
    borderRadius: 40,
  },
  input: {
    marginBottom: 30,
  },
  btn: {
    backgroundColor: colors.LIGHT,
    width: "100%",
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: colors.DARK,
  },
  error: {
    color: "red",
    marginBottom: 10,
    top: -20,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  bottomText: {
    color: colors.LIGHT,
    fontSize: 16,
  },
  link: {
    textDecorationLine: "underline",
    marginLeft: 5,
  },
  iiContainer: {
    top: 80,
  },
  imagePicker: {
    backgroundColor: colors.LIGHT,
    borderRadius: 15,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  pickerText: {
    fontSize: 18,
    color: colors.DARK,
  },
});
