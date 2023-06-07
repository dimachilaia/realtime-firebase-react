import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

const NewArticle = () => {
  const { id }: any = useParams();
  const [article, setArticle] = useState<any>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    onSnapshot(docRef, (snapshot: any) => {
      //@ts-ignore
      NewArticle({ ...snapshot.data(), id: snapshot.id });
    });
  }, []);

  return <div>NewArticle</div>;
};

export default NewArticle;
