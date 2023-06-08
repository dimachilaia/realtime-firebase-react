import React, { useEffect, useState, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import styled from "styled-components";

const ChatContainer = styled(Container)`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ChatWindow = styled.div`
  border: 1px solid #ccc;
  width: 80%;
  height: 60vh;
  overflow-y: auto;
  padding: 10px;
`;

const MessageInputContainer = styled(Form)`
  width: 80%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-top: none;
`;

const Message = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  justify-content: ${(props) =>
    props.isCurrentUser ? "flex-end" : "flex-start"};
  align-items: flex-start;
  margin-bottom: 10px;
`;

const MessageContent = styled.div<{ isCurrentUser: boolean }>`
  padding: 10px;
  border-radius: 5px;
  max-width: 60%;
  word-break: break-word;
  background-color: ${(props) => (props.isCurrentUser ? "#d4e6ff" : "#f0f0f0")};
`;

const MessageUser = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const queryMessages = query(messagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages.reverse());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser?.displayName || "Unknown User",
    });
    setNewMessage("");
  };

  return (
    <ChatContainer>
      <ChatWindow ref={chatWindowRef}>
        <div className="chat-messages">
          {auth.currentUser &&
            messages.map((message) => (
              <Message
                key={message.id}
                isCurrentUser={message.user === auth.currentUser?.displayName}
              >
                <MessageContent
                  isCurrentUser={message.user === auth.currentUser?.displayName}
                >
                  <MessageUser>{message.user}</MessageUser>
                  {message.text}
                </MessageContent>
              </Message>
            ))}
        </div>
      </ChatWindow>
      <MessageInputContainer onSubmit={handleSubmit}>
        <Form.Control
          type="text"
          placeholder="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="primary mt-3" type="submit" onClick={handleSubmit}>
          Send
        </Button>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default Chat;
