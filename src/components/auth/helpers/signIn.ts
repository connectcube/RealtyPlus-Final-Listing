import { auth, fireDataBase } from "@/lib/firebase";
import { USER } from "@/lib/typeDefinitions";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default async function signIn(credentials, updateProfile) {
  const { email, password } = credentials;
  await signInWithEmailAndPassword(auth, email, password);
  const user = auth.currentUser;
  
  // Check users collection
  const userDocRef = doc(fireDataBase, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const userData = userDocSnap.data() as USER;
  if (userDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    await updateProfile({uid: user.uid, ...userData});
    console.log("User Data:", userData); // Changed to log userData
    return {role: "users", isActive: true};
  }

  // Check agents collection
  const agentDocRef = doc(fireDataBase, "agents", user.uid);
  const agentDocSnap = await getDoc(agentDocRef);
  const agentData = agentDocSnap.data() as USER;
  if (agentDocSnap.exists()) {
    toast.success("Signed in successfully!");
    await updateProfile({uid: user.uid, ...agentData});
    console.log("Agent Data:", agentData); // Changed to log agentData instead of userData
    return {role: "agents", isActive: agentData.subscription.isActive};
  }

  // check agency
  const agencyDocRef = doc(fireDataBase, "agencies", user.uid);
  const agencyDocSnap = await getDoc(agencyDocRef);
  const agencyData = agencyDocSnap.data() as USER;
  if (agencyDocSnap.exists()) {
    toast.success("Signed in successfully!");
    await updateProfile({uid: user.uid, ...agencyData});
    console.log("Agency Data:", agencyData); // Changed to log agencyData instead of userData
    return {role: "agencies", isActive: agencyData.subscription.isActive}; // Fixed: was using agentData instead of agencyData
  }

  // check admin
  const adminsDocRef = doc(fireDataBase, "admins", user.uid);
  const adminsDocSnap = await getDoc(adminsDocRef);
  const adminsData = adminsDocSnap.data() as USER;
  if (adminsDocSnap.exists()) {
    toast.success("Signed in successfully!");
    await updateProfile({uid: user.uid, ...adminsData});
    console.log("Admin Data:", adminsData); // Changed to log adminsData instead of userData
    return {role: "admin", isActive: true};
  }

  throw new Error("User not found in either collection");
}