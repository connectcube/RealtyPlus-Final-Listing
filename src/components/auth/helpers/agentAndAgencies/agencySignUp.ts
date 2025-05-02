import { auth, fireDataBase } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export default async function agencySignUp(credentials) {
  const {
    companyName,
    businessType,
    businessRegistrationNumber,
    numberOfAgents,
    address,
    city,
    website,
    companyDescription,
    firstName,
    lastName,
    position,
    email,
    phone,
    password,
  } = credentials;
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = await userCredential.user;
  const docRef = await doc(fireDataBase, "agencies", user.uid);
  // Create user profile in Firestore
  await setDoc(docRef, {
    companyName,
    businessType,
    businessRegistrationNumber,
    numberOfAgents,
    address,
    city,
    website,
    companyDescription,
    firstName,
    lastName,
    position,
    email,
    phone,
    isSubcribed: false,
    createdAt: serverTimestamp(),
    authProvider: "email",
    userType: "agencies",
    myListings: [],
    subscription: {
      plan: "sme",
      agentsTotal: 0,
      agentsUsed: 0,
      listingsTotal: 50,
      listingsUsed: 0,
      renewalDate: serverTimestamp(),
      startDate: serverTimestamp(),
      isActive: false,
    },
  });
  // Add activity
  const activityCollectionRef = collection(fireDataBase, "recentActivities");
  await addDoc(activityCollectionRef, {
    activity: {
      action: "New Agency Signed Up",
      doer: `${firstName} ${lastName}`,
      doerRef: docRef,
    },
    type: "agent",
    doneAt: serverTimestamp(),
  });
  return user;
}
