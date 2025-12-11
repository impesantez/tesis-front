import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";

export async function getAppointments() {
  const q = query(collection(db, "appointments"), orderBy("date"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createAppointment(data) {
  await addDoc(collection(db, "appointments"), data);
}

export async function updateAppointment(id, data) {
  await updateDoc(doc(db, "appointments", id), data);
}

export async function deleteAppointment(id) {
  await deleteDoc(doc(db, "appointments", id));
}
