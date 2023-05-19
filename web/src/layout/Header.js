import { useEffect, useState } from 'react';
import { Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fcl from "@onflow/fcl";
import { FaBars, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const [user, setUser] = useState({ loggedIn: null });
  const navigate = useNavigate();

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    user.loggedIn ? navigate("/safe") : navigate("/");
  }, [user]);

  const onHandleClickWalletConnectedButton = (e) => {
    navigate("/safe")
  }

  return (
    <Navbar expand="lg">
      <Navbar.Brand>
        <Link to="/" className="d-flex text-decoration-none">
          <img src="Logo.png" width="40px" height="52px" />
          <h1 className="header-font text-white mx-2 mt-1">flowsafe</h1>
        </Link>
      </Navbar.Brand>

      <Navbar.Toggle>
        <FaBars className='text-white' />
      </Navbar.Toggle>

      <Navbar.Collapse id="basic-navbar-nav" className="flex-reverse">
        <Nav >
          {user.loggedIn ?
            <div className='d-flex gap-2'>

              <Button variant="light" className="connect-wallet" onClick={onHandleClickWalletConnectedButton}>
                WALLET CONNECTED
              </Button>
              <Button variant="Danger" className="disconnect-wallet" onClick={(e) => {
                fcl.unauthenticate();
                navigate("/");
              }}><FaSignOutAlt /></Button>
            </div>
            :
            <Button variant="light" className="connect-wallet" onClick={fcl.logIn}>
              CONNECT WALLET
            </Button>
          }
        </Nav>
      </Navbar.Collapse >
    </Navbar >
  )
}