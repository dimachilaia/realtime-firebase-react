import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error: any) {
      toast(error.code, { type: "error" });
    }
  };
  return (
    <SignInContainer>
      <SignInTitle>Sign In</SignInTitle>
      <SignInForm>
        <SignInInput
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <SignInInput
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <SignInButton type="submit" onClick={handleLogin}>
          Sign In
        </SignInButton>
      </SignInForm>
    </SignInContainer>
  );
};

export default SignIn;

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SignInTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const SignInForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const SignInInput = styled.input`
  padding: 8px;
  margin-bottom: 8px;
`;

const SignInButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 16px;
`;
