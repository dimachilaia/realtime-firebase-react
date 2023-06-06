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
    try {
      await deleteDoc(doc(db, "Articles", id));
      toast("Your Article deleted successfully", { type: "success" });
      const storageRef = ref(storage, image);
    } catch (error) {
      toast("You cannot delete the article...", { type: "error" });
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
              <ArticleImage src={image} alt="Article Image" />

              <ArticleDetails>
                {user && user.uid === userId && (
                  <div>
                    <i
                      onClick={() => handleDelete(id, image)}
                      className="fa fa-times"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                )}

                <ArticleTitle>{title}</ArticleTitle>
                <ArticleDescription>{description}</ArticleDescription>
                <ArticleAuthor>Created By: {createdBy}</ArticleAuthor>
                <ArticleDescription>
                  {createdAt.toDate().toDateString()}
                </ArticleDescription>
                <ArticleLikes>Likes: {likes?.length}</ArticleLikes>
                <ArticleLikes>Comments: {comments?.length}</ArticleLikes>
              </ArticleDetails>
              {user && <LikeArticle id={id} likes={likes} />}
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
  flex-wrap: wrap;
  justify-content: space-evenly;
  flex-wrap: wrap;
  /* justify-content: center; */
  margin: 0 auto;
`;

const AddNewArticleWrapper = styled.div`
  padding: 20px;
`;

const ArticlesList = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ArticleContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
`;

const ArticleImage = styled.img`
  width: 59%;
  height: 30vh;
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
