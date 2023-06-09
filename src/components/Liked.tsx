import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  DocumentReference,
} from "firebase/firestore";
import { Article } from "./Articles";

type LikeArticleProps = {
  id: string;
  likes: string[] | undefined;
  myArticles?: Article[];
  setMyArticles?: (articles: Article[]) => void;
};

const LikeArticle = ({
  id,
  likes,
  myArticles,
  setMyArticles,
}: LikeArticleProps) => {
  const [user]: any = useAuthState(auth);

  const likesRef: DocumentReference = doc(db, "Articles", id);

  const handleLike = () => {
    if (user && likes?.includes(user.uid)) {
      updateDoc(likesRef, {
        likes: arrayRemove(user.uid),
      })
        .then(() => {
          if (!myArticles || !setMyArticles) return;
          const updatedLikes = likes
            ? likes.filter((like) => like !== user.uid)
            : [];

          const updatedArticles = [...myArticles].map((article) => {
            if (article.id === id) {
              article.likes = updatedLikes;
            }
            return article;
          });

          setMyArticles(updatedArticles);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      if (user) {
        updateDoc(likesRef, {
          likes: arrayUnion(user.uid),
        })
          .then(() => {
            if (!myArticles || !setMyArticles) return;
            const updatedLikes = likes ? [...likes, user.uid] : [user.uid];
            const updatedArticles = [...myArticles].map((article) => {
              if (article.id === id) {
                article.likes = updatedLikes;
              }
              return article;
            });

            setMyArticles(updatedArticles);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
  };

  return (
    <div>
      <i
        className={`fa fa-heart${
          !likes?.includes(user?.uid) ? "-o" : ""
        } fa-lg`}
        style={{
          cursor: "pointer",
          color: likes?.includes(user?.uid) ? "red" : undefined,
        }}
        onClick={handleLike}
      />
    </div>
  );
};

export default LikeArticle;
