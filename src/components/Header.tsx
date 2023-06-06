import React, { useState } from "react";
import { styled } from "styled-components";
// import { Dropdown } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import { Link, useNavigate } from "react-router-dom";
import Face6Icon from "@mui/icons-material/Face6";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

const Header = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [user] = useAuthState(auth);

  return (
    <HeaderContainer>
      <Text to="/">SocialMedia</Text>
      <>
        <SearchInput>
          <SearchIconContainer
            onClick={() => setIsInputVisible(!isInputVisible)}
            isInputVisible={isInputVisible}
          >
            <SearchIcon />
          </SearchIconContainer>
          <InputField placeholder="Search..." isInputVisible={isInputVisible} />
        </SearchInput>
        <Icons>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="email-dropdown">
              <EmailIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/email">
                Email Dropdown Item
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="notifications-dropdown">
              <NotificationsIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/notifications">
                Notifications Dropdown Item
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="face-dropdown">
              <Face6Icon />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {user && (
                <Dropdown.Item
                  onClick={() => {
                    signOut(auth);
                  }}
                >
                  Log Out
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Icons>
      </>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled.div`
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  padding: 20px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Text = styled(Link)`
  color: red;
  outline: none;
  text-decoration: none;
  font-size: 24px;
  cursor: pointer;
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

interface InputFieldProps {
  isInputVisible: boolean;
}

const SearchIconContainer = styled.div<InputFieldProps>`
  position: absolute;
  left: 8px;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
    transition: 0.4s;
  }
`;

const InputField = styled.input<InputFieldProps>`
  padding: 8px 32px 8px 40px;
  border: none;
  border-radius: 20px;
  outline: none;
`;

const Icons = styled.div`
  display: flex;
  gap: 10px;
  cursor: pointer;

  :hover {
    opacity: 0.85;
    transition: 0.4s;
  }
`;
