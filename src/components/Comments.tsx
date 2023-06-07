import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

const Comments = ({ articleId }: { articleId: string }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loggedUser]: any = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const docRef = doc(db, "Articles", articleId);
    onSnapshot(docRef, (snapshot) => {
      //@ts-ignore
      setComments(snapshot.data().comments);
    });
  }, []);

  const handleCommentChange = (event: any) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async (event: any) => {
    event.preventDefault();
    const docRef = doc(db, "Articles", articleId);
    await updateDoc(docRef, {
      comments: arrayUnion({
        id: comments.length + 1,
        comment: newComment,
        userName: loggedUser.displayName,
      }),
    });
    setNewComment("");
  };

  const handleCommentDelete = async (commentId: any) => {
    const commentToDelete: any = comments.find(
      (comment: any) => comment.id === commentId
    );

    if (
      commentToDelete &&
      commentToDelete.userName === loggedUser.displayName
    ) {
      const docRef = doc(db, "Articles", articleId);
      await updateDoc(docRef, {
        comments: arrayRemove(commentToDelete),
      });
    }
  };

  return (
    <div className="comments">
      <h3 className="text-primary mb-4">Comments</h3>
      {comments !== null &&
        comments.map((comment: any) => {
          const isCurrentUserAuthor =
            comment.userName == loggedUser.displayName;

          return (
            <div key={comment.id} className="comment card mb-3">
              <div className="card-body">
                <p className="card-text">{comment.comment}</p>
              </div>
              <div className="card-footer">
                <p className="card-subtitle text-muted mb-0">
                  Author: {comment.userName}
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleCommentDelete(comment.id)}
                  disabled={!isCurrentUserAuthor}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      <form onSubmit={handleCommentSubmit}>
        <div className="form-group">
          <label htmlFor="commentInput">Your Comment</label>
          <textarea
            id="commentInput"
            className="form-control"
            value={newComment}
            onChange={handleCommentChange}
            rows={4}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Comments;
