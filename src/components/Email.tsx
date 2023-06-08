import React, { useEffect, useState, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import styled from "styled-components";
import { updateDoc } from "firebase/firestore";

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
  cursor: pointer; /* Add cursor pointer to indicate interactivity */
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

const Tooltip = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
`;

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");

  const messagesRef = collection(db, "messages");
  const handleEditMessage = (message: any) => {
    setEditingMessage(message);
    setEditedMessageContent(message.text);
  };

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
    if (editingMessage) {
      await updateDoc(doc(db, "messages", editingMessage.id), {
        text: editedMessageContent,
      });
      setEditingMessage(null);
      setEditedMessageContent("");
    } else {
      if (newMessage === "") return;
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        user: auth.currentUser?.displayName || "Unknown User",
      });
      setNewMessage("");
    }
  };
  const handleDeleteMessage = async (messageId: any) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
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
                // onDoubleClick={() => handleEditMessage(message)}
              >
                <MessageContent
                  isCurrentUser={message.user === auth.currentUser?.displayName}
                >
                  <MessageUser>{message.user}</MessageUser>
                  {message.text}
                  {message.user === auth.currentUser?.displayName && (
                    <div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="me-2 mt-2"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        disabled={editingMessage !== null}
                        variant="primary"
                        className="ms-2 mt-2"
                        size="sm"
                        onClick={() => handleEditMessage(message)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))}
        </div>
      </ChatWindow>
      <MessageInputContainer onSubmit={handleSubmit}>
        <Form.Control
          type="text"
          placeholder="Type your message"
          value={editingMessage ? editedMessageContent : newMessage}
          onChange={(e) => {
            if (editingMessage) {
              setEditedMessageContent(e.target.value);
            } else {
              setNewMessage(e.target.value);
            }
          }}
        />
        <Button variant="primary mt-3" type="submit" onClick={handleSubmit}>
          Send
        </Button>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default Chat;
