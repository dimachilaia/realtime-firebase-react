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
  Timestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { DocumentData } from "firebase/firestore";

type Comment = {
  id: number;
  comment: string;
  userName: string;
  createdAt: any;
};

type CommentData = {
  comments: Comment[];
};

type Props = {
  articleId: string;
};

const Comments: React.FC<Props> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loggedUser, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const docRef = doc(db, "Articles", articleId);
    onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data() as CommentData;
      setComments(data.comments);
    });
  }, [articleId]);

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const docRef = doc(db, "Articles", articleId);
    await updateDoc(docRef, {
      comments: arrayUnion({
        id: comments.length + 1,
        comment: newComment,
        userName: loggedUser?.displayName || "",
        createdAt: Timestamp.now(),
      }),
    });
    setNewComment("");
  };

  const handleCommentDelete = async (commentId: number) => {
    const commentToDelete = comments.find(
      (comment) => comment.id === commentId
    );

    if (
      commentToDelete &&
      commentToDelete.userName === loggedUser?.displayName
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
      {comments.length > 0 ? (
        comments.map((comment) => {
          const isCurrentUserAuthor =
            comment.userName === loggedUser?.displayName;

          return (
            <div key={comment.id} className="comment card mb-3">
              <div className="card-body">
                <p className="card-text">{comment.comment}</p>
                <p className="card-subtitle text-muted mb-0">
                  Author: {comment.userName}
                </p>
                <p className="card-subtitle text-muted mb-0">
                  Posted on:{" "}
                  {comment.createdAt &&
                    comment.createdAt.toDate().toDateString()}
                </p>
              </div>
              <div className="card-footer">
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
        })
      ) : (
        <p>No comments yet.</p>
      )}
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
        <button type="submit" className="btn btn-primary mt-2 mb-3">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Comments;
