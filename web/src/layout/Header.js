import { useEffect, useState } from 'react';
import { Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import { FaBars } from 'react-icons/fa';

export default function Header() {
  const [user, setUser] = useState({ loggedIn: null });
  const navigate = useNavigate();

  useEffect(() => { 
    fcl.currentUser.subscribe(setUser);
  }, []);  

  useEffect(() => { 
    user.loggedIn ? navigate("/backup") : navigate("/backup");
  }, [user]);

  return(
    <Navbar expand="lg">
      <Navbar.Brand>
        <Link to="/" className="d-flex text-decoration-none">
          <img src="logo512.png" width="40px" height="40px" />
          <h3 className="text-white mx-2 mt-1">FLOWSAFE</h3>
        </Link>
      </Navbar.Brand>

      <Navbar.Toggle> 
        <FaBars className='text-white' /> 
      </Navbar.Toggle>
      
      <Navbar.Collapse id="basic-navbar-nav" className="flex-reverse">
        <Nav >
          {user.loggedIn ?
          <Button variant="light" className="connect-wallet">
            WALLET CONNECTED
          </Button>
          :
          <Button variant="light" className="connect-wallet" onClick={fcl.logIn}>
            CONNECT WALLET
          </Button>
          }        
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}