import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import React, { ChangeEvent, useState } from "react";
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user: User | null = userCredential.user;
      if (user) {
        await updateProfile(user, { displayName: name });
      }
    } catch (error) {
      const errorCode = (error as any).code;
      toast(errorCode, { type: "error" });
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
          onChange={handleNameChange}
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          className="form-control"
          placeholder="Enter your email"
          type="email"
          onChange={handleEmailChange}
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          className="form-control"
          placeholder="Enter your password"
          type="password"
          onChange={handlePasswordChange}
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
