import { auth, fireDataBase } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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
  } = credentials
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
    isSubcribed:false,
    createdAt: new Date(),
    authProvider: "email",
    userType:"agency"
  });

  return user;
}
