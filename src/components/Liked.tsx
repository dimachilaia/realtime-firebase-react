import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  DocumentReference,
} from "firebase/firestore";

// ...
type LikeArticleProps = {
  id: string;
  likes: string[] | undefined;
};

const LikeArticle = ({ id, likes }: LikeArticleProps) => {
  const [user]: any = useAuthState(auth);

  const likesRef: DocumentReference = doc(db, "Articles", id);

  const handleLike = () => {
    if (user && likes?.includes(user.uid)) {
      updateDoc(likesRef, {
        likes: arrayRemove(user.uid),
      })
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    } else {
      if (user) {
        updateDoc(likesRef, {
          likes: arrayUnion(user.uid),
        })
          .then(() => {})
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
