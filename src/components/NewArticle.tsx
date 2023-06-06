import React from "react";
import { useParams } from "react-router-dom";

const NewArticle = () => {
  const { id }: any = useParams();
  console.log("id", id);
  return <div>NewArticle</div>;
};

export default NewArticle;
