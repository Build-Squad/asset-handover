import { Nav, Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Header() {
  return(
    <Navbar expand="lg">
      <Navbar.Brand>
        <Link to="/" className="text-decoration-none">
          <h2 className="text-white">AssetHandover</h2>
        </Link>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav >
        <Button variant="light" className="connect-wallet">
          CONNECT WALLET
        </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}