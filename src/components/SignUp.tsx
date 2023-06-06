import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import styled from "styled-components";
import { auth } from "../firebaseConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      //@ts-ignore
      updateProfile(auth.currentUser, { displayName: name });
      navigate("/");
    } catch (error: any) {
      toast(error.code, { type: "error" });
    }
  };

  return (
    <SignUpContainer>
      <h3>Register</h3>
      <div className="form-group">
        <label>Name:</label>
        <input
          className="form-control"
          placeholder="Enter your name"
          type="text"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          className="form-control"
          placeholder="Enter your email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          className="form-control"
          placeholder="Enter your password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn btn-primary btn-block mt-2" onClick={handleSignUp}>
        Register
      </button>
    </SignUpContainer>
  );
};

export default SignUp;

const SignUpContainer = styled.div`
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
