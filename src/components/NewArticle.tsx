import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import LikeArticle from "./Liked";

const NewArticle = () => {
  const { id }: any = useParams();
  const [article, setArticle] = useState<any>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    onSnapshot(docRef, (snapshot: any) => {
      setArticle({ ...snapshot.data(), id: snapshot.id });
    });
  }, []);

  return (
    <div className="container border bg-light" style={{ marginTop: "70px" }}>
      {article && (
        <div className="row">
          <div className="col-md-3">
            <img
              src={article.image}
              alt={article.title}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <div className="mt-3">
              Posted on: {article.createdAt.toDate().toDateString()}
            </div>
          </div>
          <div className="col-md-9">
            <h2 className="mt-3">Title: {article.title}</h2>
            <p>Description: {article.description}</p>
            <div className="d-flex flex-row-reverse">
              {user && <LikeArticle id={id} likes={article.likes} />}
              <div className="pe-2">
                <p>{article.likes.length}</p>
              </div>
            </div>{" "}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArticle;
