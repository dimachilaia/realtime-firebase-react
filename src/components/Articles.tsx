import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebaseConfig";
import { toast } from "react-toastify";
import styled from "styled-components";
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
import AddNewArticle from "./AddNewArticle";
import { ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import LikeArticle from "./Liked";
import { Link } from "react-router-dom";

interface Article {
  id?: string;
  createdAt: any;
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
  const [user] = useAuthState(auth);

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
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "Articles", id));
        toast("Your Article deleted successfully", { type: "success" });
        const storageRef = ref(storage, image);
      } catch (error) {
        toast("You cannot delete the article...", { type: "error" });
      }
    }
  };

  return (
    <Container>
      <ArticlesList>
        {myArticles.map(
          ({
            id,
            title,
            description,
            image,
            createdBy,
            likes,
            createdAt,
            userId,
            comments,
          }) => (
            <ArticleContainer key={id}>
              <ArticleImageContainer>
                <Link to={`/article/${id}`}>
                  <ArticleImage src={image} alt="Article Image" />
                </Link>
              </ArticleImageContainer>
              <ArticleDetails>
                {user && user.uid === userId && (
                  <DeleteButton onClick={() => handleDelete(id, image)}>
                    <i className="fa fa-times" />
                  </DeleteButton>
                )}
                <ArticleTitle>{title}</ArticleTitle>
                <ArticleDescription>{description}</ArticleDescription>
                <ArticleCreatedBy>Created By: {createdBy}</ArticleCreatedBy>
                <ArticleCreatedAt>
                  Date: {createdAt.toDate().toDateString()}
                </ArticleCreatedAt>
                <ArticleLikes>Likes: {likes?.length}</ArticleLikes>
                <ArticleComments>Comments: {comments?.length}</ArticleComments>
              </ArticleDetails>
              <LikesContainer>
                {user && <LikeArticle id={id} likes={likes} />}
              </LikesContainer>
            </ArticleContainer>
          )
        )}
      </ArticlesList>
      <AddNewArticleWrapper>
        <AddNewArticle />
      </AddNewArticleWrapper>
    </Container>
  );
};

export default Articles;

const Container = styled.div`
  display: flex;
  justify-content: center;
  justify-content: space-evenly;
  padding: 10px 20px;
  /* gap: 100px; */
  @media screen and (max-width: 768px) {
    flex-wrap: wrap-reverse;
  }
`;

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ArticleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f8f8f8;
  position: relative;
`;

const ArticleImageContainer = styled.div`
  flex: 0 0 180px;
`;

const ArticleImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const ArticleDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ArticleTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 5px;
`;

const ArticleDescription = styled.p`
  font-size: 16px;
  margin-bottom: 5px;
`;

const ArticleCreatedBy = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const ArticleCreatedAt = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const ArticleLikes = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const ArticleComments = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
`;

const LikesContainer = styled.div`
  position: absolute;
  bottom: 10px;
  right: 20px;
`;

const AddNewArticleWrapper = styled.div`
  padding: 20px;
`;
