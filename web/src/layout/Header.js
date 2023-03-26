import { Nav, Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Header() {
  return(
    <Navbar expand="lg">
      <Navbar.Brand>
        <Link to="/" className="d-flex text-decoration-none">
          <img src="logo512.png" width="50px" height="50px" />
          <h2 className="text-white mx-3">AssetHandover</h2>
        </Link>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      <Navbar.Collapse id="basic-navbar-nav" className="flex-reverse">
        <Nav >
        <Button variant="light" className="connect-wallet">
          CONNECT WALLET
        </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}