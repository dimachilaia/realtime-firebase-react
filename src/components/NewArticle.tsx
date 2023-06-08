import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import LikeArticle from "./Liked";
import Comments from "./Comments";

const NewArticle = () => {
  const { id }: any = useParams();
  const [article, setArticle] = useState<any>(null);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    onSnapshot(docRef, (snapshot) => {
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
            <button
              className="btn btn-danger mt-3"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <div className="mt-3">
              Title:
              <span style={{ color: "blue", fontSize: "27px" }}>
                {article.title}
              </span>
            </div>
            <p>Description: {article.description}</p>
            <div className="d-flex flex-row-reverse">
              {user && <LikeArticle id={id} likes={article.likes} />}
              <div className="pe-2">
                <p>{article.likes.length}</p>
              </div>
            </div>
            <Comments articleId={id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArticle;
