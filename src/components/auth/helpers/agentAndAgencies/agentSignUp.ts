import { auth, fireDataBase } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

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
    createdAt: serverTimestamp(),
    authProvider: "email",
    userType: "agents",
    myListings: [],
    myAgents: [],
    subscription: {
      listingsUsed: 0,
      plan: "free",
      isActive: true,
      listingsTotal: 0,
      renewalDate: serverTimestamp(),
    },
  });
  // Add activity
  const activityCollectionRef = collection(fireDataBase, "recentActivities");
  await addDoc(activityCollectionRef, {
    activity: {
      action: "New Agent Signed Up",
      doer: `${firstName} ${lastName}`,
      doerRef: docRef,
    },
    type: "agent",
    doneAt: serverTimestamp(),
  });
  return user;
}
