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
  getDocs,
  DocumentSnapshot,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import styled from "styled-components";
import { updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";

type Message = {
  id: string;
  text: string;
  createdAt: any;
  user: string;
  private: boolean;
};

type PrivateMessage = {
  message: string;
  users: string[];
  sender: string;
  createdAt: Date;
};

type User = {
  name: string;
  id: string;
};

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chosenChat, setChosenChat] = useState<User | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null);
  const messagesRef = collection(db, "messages");
  const privateMessagesRef = collection(db, "privateMessages");
  const [user] = useAuthState(auth);

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditedMessageContent(message.text);
  };

  useEffect(() => {
    const usersRef = collection(db, "users");
    const queryUsers = query(usersRef);
    getDocs(queryUsers).then((data) =>
      setUsers(
        data.docs.map((item: DocumentSnapshot<DocumentData>) => ({
          ...(item.data() as User),
        }))
      )
    );

    if (!chosenChat) {
      const queryMessages = query(messagesRef, orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          messages.push({ ...doc.data(), id: doc.id } as Message);
        });
        setMessages(messages.reverse());
      });
      return () => unsubscribe();
    } else {
      const q = query(
        privateMessagesRef,
        where("users", "array-contains", user?.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: PrivateMessage[] = [];
        snapshot.forEach((doc) => {
          if (doc.data().users.includes(chosenChat.id)) {
            messages.push({
              ...doc.data(),
              id: doc.id,
            } as unknown as PrivateMessage);
          }
        });
        setPrivateMessages(
          messages.sort((a: any, b: any) => a.createdAt - b.createdAt)
        );
      });
      return () => unsubscribe();
    }
  }, [chosenChat]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatWindowRef.current]);

  useEffect(() => {
    const chatWindowElement = chatWindowRef.current;
    if (chatWindowElement) {
      chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
    }
  }, [messages, privateMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage === "" && !editingMessage) return;

    if (chosenChat) {
      await addDoc(privateMessagesRef, {
        message: newMessage,
        createdAt: serverTimestamp(),
        users: [chosenChat?.id, user?.uid],
        sender: user?.uid,
      });
      setNewMessage("");
      return;
    }

    if (editingMessage) {
      await updateDoc(doc(db, "messages", editingMessage.id), {
        text: editedMessageContent,
      });
      setEditingMessage(null);
      setEditedMessageContent("");
    } else {
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
        toast("Deleted!", { type: "success" });
      } catch (error) {
        console.error("Error deleting message:", error);
      }
      setDeleteMessage(null);
    }
  };

  if (!user) {
    return (
      <LogInText>
        Welcome to the Chat App! Please log in to communicate with registered
        accounts.
      </LogInText>
    );
  }

  return (
    <WholeContainer>
      <Users>
        {users
          .filter((oneUser) => oneUser.id !== user?.uid)
          .map((user) => {
            if (!user.name) return null;
            return (
              <User
                key={user.id}
                className={`container mb-2 ${
                  chosenChat?.id === user.id ? "active" : ""
                }`}
                onClick={() => {
                  if (chosenChat?.id === user.id) {
                    setChosenChat(null);
                  } else {
                    setChosenChat(user);
                  }
                }}
              >
                <span className="text-primary">{user.name}</span>
              </User>
            );
          })}
      </Users>
      <ChatContainer>
        <h5>
          You are now logged in and can start conversations with other
          registered users!
        </h5>
        <h3 style={{ color: "red" }}>
          {chosenChat ? `Chat With ${chosenChat.name}` : "General Chat"}
        </h3>
        <ChatWindow ref={chatWindowRef}>
          <div className="chat-messages">
            {auth.currentUser && !chosenChat
              ? messages.map((message) => (
                  <Message
                    key={message.id}
                    isCurrentUser={
                      message.user === auth.currentUser?.displayName
                    }
                  >
                    <MessageContent
                      isCurrentUser={
                        message.user === auth.currentUser?.displayName
                      }
                    >
                      <MessageUser>{message.user}</MessageUser>
                      {message.text}
                      {message.user === auth.currentUser?.displayName && (
                        <div className="message-actions">
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
                            className="mt-2"
                            size="sm"
                            onClick={() => handleEditMessage(message)}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                ))
              : privateMessages.map((message, i) => (
                  <Message
                    key={i}
                    isCurrentUser={message.sender === auth.currentUser?.uid}
                  >
                    <MessageContent
                      isCurrentUser={message.sender === auth.currentUser?.uid}
                    >
                      <MessageUser>
                        {message.sender === user?.uid
                          ? user.displayName
                          : chosenChat?.name}
                        :
                      </MessageUser>
                      {message.message}
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
    </WholeContainer>
  );
};

export default Chat;

const WholeContainer = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 50px 1fr;
  }
`;

const Users = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 10px;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    min-height: unset;
  }
`;

const User = styled.div`
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;
  color: #000;
  transition: background-color 0.3s ease;
  margin-bottom: 8px;

  &:hover {
    background-color: #e1e1e1;
  }

  &.active {
    background-color: #d4e6ff;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    margin-right: 8px;
    margin-bottom: 0;
  }
`;

const ChatContainer = styled(Container)`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: unset;
    padding-top: 50px;
  }
`;

const ChatWindow = styled.div`
  border: 1px solid #ccc;
  width: 80%;
  height: 60vh;
  overflow-y: auto;
  padding: 10px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MessageInputContainer = styled(Form)`
  width: 80%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-top: none;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Message = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  justify-content: ${(props) =>
    props.isCurrentUser ? "flex-end" : "flex-start"};
  margin-bottom: 8px;
`;

const MessageContent = styled.div<{ isCurrentUser: boolean }>`
  background-color: ${(props) => (props.isCurrentUser ? "#dcf8c6" : "#eee")};
  padding: 8px;
  border-radius: 8px;
  max-width: 70%;
`;

const MessageUser = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const LogInText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
