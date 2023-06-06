import { Timestamp, addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebaseConfig";
import {
  StorageReference,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadTask,
} from "firebase/storage";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import SignIn from "./Login";
import SignUp from "./SignUp";

interface ArticlesData {
  title: string;
  description: string;
  image: File | null;
  createdAt: Date;
}

const AddNewArticle = () => {
  const [progressIndicator, setProgressIndicator] = useState(0);
  const [user] = useAuthState(auth);
  const [showSignUp, setShowSignUp] = useState(false);

  const [articlesData, setArticlesData] = useState<ArticlesData>({
    title: "",
    image: null,
    description: "",
    createdAt: Timestamp.now().toDate(),
  });

  const uploadArticle = () => {
    const storageRef: StorageReference = ref(
      storage,
      `/images/${Date.now()}${articlesData.image!.name}`
    );

    const uploadImage: UploadTask = uploadBytesResumable(
      storageRef,
      articlesData.image!
    );

    uploadImage.on(
      "state_changed",
      (snapshot) => {
        const progressPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgressIndicator(progressPercent);
      },
      (err) => {
        console.log(err);
      },
      () => {
        setArticlesData({
          title: "",
          description: "",
          image: null,
          createdAt: Timestamp.now().toDate(),
        });
        getDownloadURL(uploadImage.snapshot.ref).then((url) => {
          const articleRef = collection(db, "Articles");
          addDoc(articleRef, {
            title: articlesData.title,
            description: articlesData.description,
            image: url,
            createdAt: Timestamp.now().toDate(),
            createdBy: user?.displayName,
            userId: user?.uid,
            likes: [],
            comments: [],
          })
            .then(() => {
              toast("Article Added Successfully", { type: "success" });
              setProgressIndicator(0);
            })
            .catch((err) => {
              toast("Error adding article", { type: "error" });
            });
        });
      }
    );
  };

  return (
    <div>
      {!user ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {showSignUp ? <SignUp /> : <SignIn />}
          <span className="ml-3">
            Don't you have an account ?
            <button
              className="ml-2 btn btn-outline-primary"
              onClick={() => setShowSignUp(!showSignUp)}
            >
              {showSignUp ? "Sign Up" : "Sign In"}
            </button>
          </span>
        </div>
      ) : (
        <div className="container">
          <h1>Add New Article</h1>

          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="form-control"
              value={articlesData.title}
              onChange={(e) => {
                setArticlesData({ ...articlesData, title: e.target.value });
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              className="form-control"
              value={articlesData.description}
              onChange={(e) => {
                setArticlesData({
                  ...articlesData,
                  description: e.target.value,
                });
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              className="form-control"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setArticlesData({
                    ...articlesData,
                    image: e.target.files[0],
                  });
                }
              }}
            />
          </div>

          {progressIndicator === 0 ? null : (
            <div className="progress mb-3">
              <div
                className="progress-bar progress-bar-striped"
                style={{ width: `${progressIndicator}%` }}
              >
                Uploading... {progressIndicator}%
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => {
              if (
                !articlesData.title ||
                !articlesData.description ||
                !articlesData.image
              ) {
                return;
              }
              uploadArticle();
            }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
};

export default AddNewArticle;

const Article = styled.div`
  /* width: 50%; */
  /* margin: auto; */
`;
