import {
  collection,
  onSnapshot,
  orderBy,
  query,
  DocumentSnapshot,
  DocumentData,
  deleteDoc,
  doc,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import styled from "styled-components";
import { toast } from "react-toastify";
import { ref } from "firebase/storage";
import AddNewArticle from "./AddNewArticle";

interface Article {
  id?: string;
  createdAt: number;
  title: string;
  description: string;
  image: string;
  createdBy: string;
  userId: string;
  likes: number[];
  comments: string[];
}

const Articles: React.FC = () => {
  const [myArticles, setMyArticles] = useState<Article[]>([]);

  useEffect(() => {
    const ref = collection(db, "Articles");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const articlesInfo: Article[] = querySnapshot.docs.map(
        (item: DocumentSnapshot<DocumentData>) => ({
          id: item.id,
          ...(item.data() as Article),
        })
      );
      setMyArticles(articlesInfo);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: any, image: any) => {
    try {
      await deleteDoc(doc(db, "Articles", id));
      toast("Your Article deleted successfully", { type: "success" });
      const storageRef = ref(storage, image);
    } catch (error) {
      toast("You can not delete Article...", { type: "error" });
    }
  };

  return (
    <div>
      {/* {myArticles.length === 0 ? (
        <h4>Articles not found!</h4>
      ) : ( */}
      <div>
        {myArticles.map(
          ({ id, title, description, image, createdBy, likes }) => (
            <ArticleContainer key={id}>
              <ArticleImage src={image} alt="Article Image" />
              <ArticleDetails>
                <ArticleTitle>{title}</ArticleTitle>
                <ArticleDescription>{description}</ArticleDescription>
                <ArticleAuthor>Created By: {createdBy}</ArticleAuthor>
                <ArticleLikes>Likes: {likes?.length}</ArticleLikes>
                <div>
                  <i
                    onClick={() => handleDelete(id, image)}
                    className="fa fa-times"
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </ArticleDetails>
            </ArticleContainer>
          )
        )}
        <AddNewArticle />
      </div>
      {/* )} */}
    </div>
  );
};

export default Articles;
const ArticleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ArticleImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: cover;
`;

const ArticleDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 5px;
`;

const ArticleDescription = styled.p`
  font-size: 16px;
  margin-bottom: 5px;
`;

const ArticleAuthor = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const ArticleLikes = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;
