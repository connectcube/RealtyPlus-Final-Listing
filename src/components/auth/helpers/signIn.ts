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
    updateProfile({uid:user.uid ,...userData});
    return "users";
  }

  // Check agents collection
  const agentDocRef = doc(fireDataBase, "agents", user.uid);
  const agentDocSnap = await getDoc(agentDocRef);
  const agentData = agentDocSnap.data() as USER;
  if (agentDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    updateProfile({uid:user.uid ,...agentData});
    return "agents";
  }
// check agency
  const agencyDocRef = doc(fireDataBase, "agencies", user.uid);
  const agencyDocSnap = await getDoc(agencyDocRef);
  const agencyData = agencyDocSnap.data() as USER;
  if (agencyDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    updateProfile({uid:user.uid ,...agencyData});
    return "agencies";
  }
  //check admin
  // check agency
  const adminsDocRef = doc(fireDataBase, "admins", user.uid);
  const adminsDocSnap = await getDoc(adminsDocRef);
  const adminsData = adminsDocSnap.data() as USER;
  if (adminsDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    updateProfile({uid:user.uid ,...adminsData});
    return "admins";
  }
  throw new Error("User not found in either collection");
}
