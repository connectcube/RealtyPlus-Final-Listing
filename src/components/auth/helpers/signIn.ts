import { auth, fireDataBase } from "@/lib/firebase";
import { User } from "@/lib/typeDefinitions";
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
  const userData = userDocSnap.data() as User;
  if (userDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    updateProfile(userData);
    return "user";
  }

  // Check agents collection
  const agentDocRef = doc(fireDataBase, "agents", user.uid);
  const agentDocSnap = await getDoc(agentDocRef);
  const agentData = agentDocSnap.data() as User;
  if (agentDocSnap.exists()) {
    toast.success("Signed in successfully!, taking you to the destination");
    updateProfile(agentData);
    return "agent";
  }

  throw new Error("User not found in either collection");
}
