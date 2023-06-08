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
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import styled from "styled-components";
import { updateDoc } from "firebase/firestore";

type Message = {
  id: string;
  text: string;
  createdAt: any;
  user: string;
};

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null);

  const messagesRef = collection(db, "messages");
  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditedMessageContent(message.text);
  };

  useEffect(() => {
    const queryMessages = query(messagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id } as Message);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleDeleteMessage = (message: Message) => {
    setDeleteMessage(message);
  };

  const confirmDeleteMessage = async () => {
    if (deleteMessage) {
      try {
        await deleteDoc(doc(db, "messages", deleteMessage.id));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
      setDeleteMessage(null);
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
                        className="me-1 mt-2"
                        onClick={() => handleDeleteMessage(message)}
                      >
                        Delete
                      </Button>
                      <Button
                        disabled={editingMessage !== null}
                        variant="primary"
                        className=" mt-2"
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
      <Modal
        show={deleteMessage !== null}
        onHide={() => setDeleteMessage(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete the message?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteMessage(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteMessage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </ChatContainer>
  );
};

export default Chat;

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
  cursor: pointer;
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
