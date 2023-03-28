import { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import { Tab, Nav, Card, Button, Form, } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';

export default function Backup() {
  const [user, setUser] = useState({ loggedIn: null });
  const [isCreate, setIsCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    fcl.currentUser.subscribe(setUser);
  }, []);  

  const logout = () => {
    fcl.unauthenticate();
    navigate("/");
  }

  return(
    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
      <div className="row mt-5 mb-5">
        <div className='col-xl-2 col-lg-3'>
          <Nav variant="pills" className="search-pad">
            <Nav.Item className="type">
              <Nav.Link eventKey="first" className="text-center">
                <img src="logo192.png" width="80%" height="80%" />
                <h5 className='mt-3'>BACKUPS</h5>
              </Nav.Link>
            </Nav.Item>        

            <Nav.Item className="type">
              <Nav.Link eventKey="second" className="text-center">
                <img src="logo192.png" width="80%" height="80%" />
                <h5 className='mt-3'>PLEDGES</h5>
              </Nav.Link>
            </Nav.Item>      

            <Nav.Item className="type">
              <Nav.Link eventKey="third" className="text-center" onClick={() => logout()}>
                <p className='text-grey mb-0'>
                  {user.addr}
                </p>                
                <img className='mt-1' src="logo192.png" width="45%" height="45%" />
                <h5 className="mt-3 text-danger">DISCONNECT <br/> WALLET</h5>
              </Nav.Link>
            </Nav.Item>           
          </Nav>
        </div>

        <div className='col-xl-10 col-lg-9 d-flex pb-2'>
          <Tab.Content className='w-100'>
            {!isCreate ?
            <Tab.Pane eventKey="first">
              <div className='row'>
                <div className='col-xl-3 col-lg-5'>
                  <Card className="text-center">
                    <Card.Img className='item-img' variant="top" src="logo192.png" />
                    <Card.Body>
                      <Card.Title>Lorem ipsum dolor</Card.Title>
                      <p className='text-grey mb-0'>
                        {user.addr}
                      </p>
                      <p className='font-14 mb-0'>Created on</p>
                      <p className='mb-1'>12 March 2023</p>

                      <p className='text-danger font-14 mb-0'>Maturity Date</p>
                      <p className='text-danger'>3 Jan 2027</p>

                      <Button variant="dark" size="sm" className='me-5'>Edit</Button>
                      <Button variant="danger" size="sm">Remove</Button>
                    </Card.Body>
                  </Card>
                </div>
              </div> 

              <div className='row justify-content-end mt-5'>
                <div className='col-xl-3 col-lg-5 text-center cursor-pointer' onClick={setIsCreate(true)}>
                  <FaPlus className='mt-5 me-2' size={60} />
                  <h5 className='mt-3 text-danger'>CREATE NEW BACKUP</h5>
                </div>
              </div>             
            </Tab.Pane>
            :
            <Tab.Pane eventKey="first">
              <div className='row p-3'>
                <div className='col-md-6'>
                  <h4 className='text-danger mb-4'>
                    CREATE NEW BACKUP
                  </h4>
                  <h5 className='mb-5'>
                    Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Proin luctus ut enim a aliquam. Ut
                    vel ante non nibh lacinia hendrerit a sed risus.
                    Sed elit diam, mattis quis porta in, dignissim quis
                    ex. Morbi ut nulla a nisl sagittis luctus id sed erat.
                    Class aptent taciti sociosqu ad litora torquent per
                    conubia nostra, per inceptos himenaeos. Sed
                    efficitur pulvinar sapien.
                  </h5>
                  <img className='m-auto' src="logo512.png" width="50%" height="auto" />
                </div>

                <div className='col-md-6'>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Backup Name <span className='text-danger'>*</span>
                      </Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Recipient's Wallet ID <span className='text-danger'>*</span>
                      </Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Backup Date 
                      </Form.Label>
                      <Form.Control type="text" placeholder="Today's Date" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Maturity Date <span className='text-danger'>*</span>
                      </Form.Label>
                      <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" rows={3} />
                    </Form.Group>

                    <Button className='border-radius-none mt-3' variant="danger" type="submit">
                      CREATE BACKUP
                    </Button>
                  </Form>
                </div>
              </div>
            </Tab.Pane>
            }
            
            <Tab.Pane eventKey="second">
              <h1 className="text-white">
                Pledges Content
              </h1>
            </Tab.Pane>
          </Tab.Content>
        </div>        
      </div>
    </Tab.Container>
  )
}