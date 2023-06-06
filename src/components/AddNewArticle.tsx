import { Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import { styled } from "styled-components";

interface ArticlesData {
  title: string;
  description: string;
  image: File | null;
  createdAt: Date;
}
const AddNewArticle = () => {
  const [ArticlesData, setArticlesData] = useState<ArticlesData>({
    title: "",
    image: null,
    description: "",
    createdAt: Timestamp.now().toDate(),
  });
  return (
    <Article>
      <h1>Add New Article</h1>

      <label htmlFor="title">Title</label>
      <input
        type="text"
        name="title"
        id="title"
        className="form-control"
        value={ArticlesData.title}
        onChange={(e) => {
          setArticlesData({ ...ArticlesData, [e.target.name]: e.target.value });
        }}
      />

      {/* Description */}
      <label htmlFor="description">Description</label>
      <textarea
        name="description"
        id="description"
        className="form-control"
        value={ArticlesData.description}
        onChange={(e) => {
          setArticlesData({ ...ArticlesData, [e.target.name]: e.target.value });
        }}
      />
      {/* @mail */}
      <label htmlFor="image">Image</label>
      <input
        type="file"
        name="image"
        id="image"
        accept="image/*"
        className="form-control"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setArticlesData({ ...ArticlesData, image: e.target.files[0] });
          }
        }}
      />

      <button
        className="form-control btn-primary mt-2"
        onClick={() => {
          if (
            !ArticlesData.title ||
            !ArticlesData.description ||
            !ArticlesData.image
          ) {
            return;
          }
        }}
      >
        Post
      </button>
    </Article>
  );
};

export default AddNewArticle;

const Article = styled.div`
  width: 50%;
  align-items: end;
`;
