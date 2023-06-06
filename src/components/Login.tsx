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

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigate("/");
    } catch (error: any) {
      toast(error.code, { type: "error" });
    }
  };

  return (
    <SignInContainer>
      <h3>Sign In</h3>
      <SignInForm>
        <div className="form-group">
          <label>Email:</label>
          <SignInInput
            type="email"
            className="form-control"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <SignInInput
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-block" onClick={handleLogin}>
          Sign In
        </button>
      </SignInForm>
    </SignInContainer>
  );
};

export default SignIn;

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  margin-top: 50px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
