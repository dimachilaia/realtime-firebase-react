import React, { useState, useEffect, useRef } from "react";
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
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import AddNewArticle from "./AddNewArticle";
import { ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import LikeArticle from "./Liked";
import { Link } from "react-router-dom";
import Loading from "./Loading/Loading";
import { Modal, Button } from "react-bootstrap";

export interface Article {
  id: string;
  createdAt: any;
  title: string;
  description: string;
  image: string;
  createdBy: string;
  userId: string;
  likes: any;
  comments: string[];
}

const Articles = ({ searchQuery }: { searchQuery: string }) => {
  const [deleteArticle, setDeleteArticle] = useState<
    | {
        id: string;
        image: string;
      }
    | any
  >(null);
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [lastArticleCreatedAt, setLastArticleCreatedAt] = useState<
    number | null
  >(null);
  const [subscribed, setSubscribed] = useState(false);

  const PAGE_SIZE = 3;

  const fetchInitialArticles = async () => {
    setLoading(true);
    const articlesRef = collection(db, "Articles");
    const q = query(
      articlesRef,
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const querySnapshot = await getDocs(q);

    const articlesInfo: Article[] = querySnapshot.docs.map(
      (item: DocumentSnapshot<DocumentData>) => ({
        ...(item.data() as Article),
        id: item.id,
      })
    );

    setMyArticles(articlesInfo);
    const lastArticle = querySnapshot.docs[querySnapshot.docs.length - 1];
    setLastArticleCreatedAt(lastArticle?.data().createdAt);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);

    fetchInitialArticles();
  }, []);

  const fetchNextPage = async () => {
    if (!lastArticleCreatedAt) return;

    const articlesRef = collection(db, "Articles");
    const q = query(
      articlesRef,
      orderBy("createdAt", "desc"),
      startAfter(lastArticleCreatedAt),
      limit(PAGE_SIZE)
    );

    const querySnapshot = await getDocs(q);

    const articlesInfo: Article[] = querySnapshot.docs.map(
      (item: DocumentSnapshot<DocumentData>) => ({
        ...(item.data() as Article),
        id: item.id,
      })
    );

    setMyArticles((prevArticles) => [...prevArticles, ...articlesInfo]);
    const lastArticle = querySnapshot.docs[querySnapshot.docs.length - 1];
    setLastArticleCreatedAt(lastArticle?.data().createdAt);
  };

  useEffect(() => {
    if (!subscribed) return;

    const articlesRef = collection(db, "Articles");
    const q = query(articlesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const articlesInfo: Article[] = querySnapshot.docs.map(
        (item: DocumentSnapshot<DocumentData>) => ({
          ...(item.data() as Article),
          id: item.id,
        })
      );
      setMyArticles(articlesInfo);
      const lastArticle = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastArticleCreatedAt(lastArticle?.data().createdAt);
    });

    return () => unsubscribe();
  }, [subscribed]);

  const filteredArticles = myArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, image: string) => {
    try {
      await deleteDoc(doc(db, "Articles", id));
      if (myArticles.length > PAGE_SIZE) {
        const newArticles = [...myArticles].filter(
          (article) => article.id !== id
        );
        setMyArticles(newArticles);
      } else {
        fetchInitialArticles();
      }
      toast("Your Article deleted successfully", { type: "success" });
      const storageRef = ref(storage, image);
    } catch (error) {
      toast("You cannot delete the article...", { type: "error" });
    }
    setDeleteArticle(null);
  };

  if (loading) return <Loading />;

  return (
    <>
      <Container>
        <ArticlesList>
          {filteredArticles.map(
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
                    <DeleteButton
                      onClick={() => setDeleteArticle({ id, image })}
                    >
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
                  <ArticleComments>
                    Comments: {comments?.length}
                  </ArticleComments>
                </ArticleDetails>
                <LikesContainer>
                  {user && (
                    <LikeArticle
                      myArticles={myArticles}
                      setMyArticles={setMyArticles}
                      id={id}
                      likes={likes}
                    />
                  )}
                </LikesContainer>
              </ArticleContainer>
            )
          )}
        </ArticlesList>
        <AddNewArticleWrapper>
          <AddNewArticle
            myArticles={myArticles}
            setMyArticles={setMyArticles}
          />
        </AddNewArticleWrapper>
      </Container>
      {myArticles.length === 0 ? <p>No more items</p> : null}
      <Modal
        show={deleteArticle !== null}
        onHide={() => setDeleteArticle(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the article?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteArticle(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              handleDelete(deleteArticle?.id, deleteArticle?.image)
            }
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <ButtonContainer
        className="btn btn-primary mb-3 mt-3 btn"
        onClick={fetchNextPage}
      >
        Load More...
        {loading && <span className="sr-only">Loading...</span>}
      </ButtonContainer>
    </>
  );
};

export default Articles;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  padding: 20px 20px;
  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column-reverse;
  }
`;

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ArticleContainer = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  gap: 8px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f8f8f8;
  position: relative;

  @media (min-width: 768px) {
    grid-template-columns: 300px 1fr;
    gap: 30px;
  }
`;

const ArticleImageContainer = styled.div`
  flex: 0 0 180px;
`;

const ArticleImage = styled.img`
  width: 100%;
`;

const ArticleDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 32px;
  padding-top: 8px;
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

const ButtonContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 50%;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;
