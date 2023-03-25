import { Nav, Navbar, Button } from "react-bootstrap";

export default function Header() {
  return(
    <Navbar expand="lg">
      <Navbar.Brand href="#home">
        <h2 className="text-white">AssetHandover</h2>
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