import { auth, fireDataBase } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default async function agentSignUp(credentials) {
  const {
    companyName,
    firstName,
    lastName,
    email,
    phone,
    password,
    address,
    city,
    agentType,
    licenseNumber,
    bio,
  } = credentials;
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = await userCredential.user;
  const docRef = await doc(fireDataBase, "agents", user.uid);
  // Create user profile in Firestore
  await setDoc(docRef, {
    companyName,
    email,
    firstName,
    lastName,
    phone,
    address,
    city,
    agentType,
    licenseNumber,
    bio,
    createdAt: new Date(),
    authProvider: "email",
    userType:"agent"
  });

  return user;
}
