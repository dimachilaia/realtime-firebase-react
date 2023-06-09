import { Timestamp, addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
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
import SignIn from "./Login";
import SignUp from "./SignUp";
import Loading from "./Loading/Loading";
import { Article } from "./Articles";

interface ArticlesData {
  title: string;
  description: string;
  image: File | null;
  createdAt: Date;
}

interface Props {
  myArticles: Article[];
  setMyArticles: (articles: Article[]) => void;
}

const AddNewArticle = ({ myArticles, setMyArticles }: Props) => {
  const [progressIndicator, setProgressIndicator] = useState(0);
  const [user, loading] = useAuthState(auth);
  const [showSignUp, setShowSignUp] = useState(false);
  const [articlesData, setArticlesData] = useState<ArticlesData>({
    title: "",
    image: null,
    description: "",
    createdAt: Timestamp.now().toDate(),
  });
  useEffect(() => {
    const successMessage = localStorage.getItem("successMessage");
    if (successMessage) {
      toast(successMessage, { type: "success" });
      localStorage.removeItem("successMessage");
    }
  }, []);
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
          const now = Timestamp.now();
          const newArticle = {
            title: articlesData.title,
            description: articlesData.description,
            image: url,
            createdAt: now,
            createdBy: user?.displayName,
            userId: user?.uid,
            likes: [],
            comments: [],
          };
          addDoc(articleRef, newArticle)
            .then(() => {
              const newArticles: any = [...myArticles];
              newArticles.unshift({
                ...newArticle,
                id: newArticle.createdAt.toDate().toISOString(),
                createdAt: now,
              });

              setMyArticles(newArticles);
              const successMessage = "Article Added Successfully";
              localStorage.setItem("successMessage", successMessage);
              setProgressIndicator(0);
              window.location.reload();
            })
            .catch((err) => {
              toast("Error adding article", { type: "error" });
            });
        });
      }
    );
  };

  if (loading) return <Loading />;
  return (
    <div>
      {!user ? (
        <div>
          {showSignUp ? <SignUp /> : <SignIn />}
          <div
            className="ml-3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              margin: "10px auto",
              width: "100%",
            }}
          >
            Don't you have an account ?
            <button
              className="ml-2 mt-2 btn btn-primary"
              onClick={() => setShowSignUp(!showSignUp)}
            >
              {showSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      ) : (
        <div className="container">
          <h3 style={{ color: "red" }}>Add New Post...</h3>

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
                toast.error("All fields are required");
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
