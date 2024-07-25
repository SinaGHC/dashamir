import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

export const uploadImage = async (image) => {
  try {
    if (!image) {
      console.error("No image selected");
      return null;
    }

    const { uri } = await FileSystem.getInfoAsync(image);
    if (!uri) {
      console.error("URI is null");
      return null;
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
    const snapshot = await uploadBytes(storageRef, blob);
    console.log("Uploaded a blob or file!");
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    return null;
  }
};
export const pickImageAsync = async () => {
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result !== null && !result.cancelled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error picking image: ", error);
    return null;
  }
};
