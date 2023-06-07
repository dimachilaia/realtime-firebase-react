import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const Chat = () => {
  const [newMessage, setNewMessage] = useState<any>("");
  const [messages, setMessages] = useState([]);

  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const queryMessages = query(messagesRef);
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages: any = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser?.displayName,
    });
    setNewMessage("");
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.user === "user" ? "user" : "bot"
                  }`}
                >
                  <strong>{message.user}: </strong>
                  {message.text}
                </div>
              ))}
            </div>
            <Form className="chat-input" onSubmit={handleSubmit}>
              <Form.Control
                type="text"
                placeholder="Type your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Send
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
