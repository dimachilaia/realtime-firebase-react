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

const Header = ({ setSearchQuery, searchQuery }: any) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [user] = useAuthState(auth);

  return (
    <HeaderContainer>
      <Text to="/">SocialConnect</Text>
      <>
        <SearchInput>
          <SearchIconContainer
            onClick={() => setIsInputVisible(!isInputVisible)}
            isInputVisible={isInputVisible}
          >
            <SearchIcon />
          </SearchIconContainer>
          <InputField
            placeholder="Search by title..."
            isInputVisible={isInputVisible}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInput>
        {user && <h6>Welcome, {user.displayName || user.email}</h6>}
        <Icons>
          <Dropdown as={Link} to="/email">
            <Dropdown.Toggle variant="secondary" id="email-dropdown">
              <EmailIcon />
            </Dropdown.Toggle>
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
  z-index: 1;
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
  color: #1100ff;
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
