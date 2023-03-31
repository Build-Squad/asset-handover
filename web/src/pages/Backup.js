import { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import { Tab, Nav, Card, Button, Form, } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';

export default function Backup() {
  const [user, setUser] = useState({ loggedIn: null });
  const [step, setStep] = useState("default");
  const navigate = useNavigate();

  useEffect(() => { 
    fcl.currentUser.subscribe(setUser);
    setStep("nfts");
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
              <Nav.Link eventKey="first" className="text-center" onClick={() => setStep("default")}>
                <img src="safe.png" width="80%" height="80%" />
                <h5 className='mt-3 blue-font'>BACKUPS</h5>
              </Nav.Link>
            </Nav.Item>        

            <Nav.Item className="type">
              <Nav.Link eventKey="second" className="text-center">
                <img src="pleages.png" width="80%" height="80%" />
                <h5 className='mt-3 blue-font'>PLEDGES</h5>
              </Nav.Link>
            </Nav.Item>      

            <Nav.Item className="type" onClick={() => logout()}>
              <Nav.Link eventKey="third" className="text-center">
                <p className='text-grey mb-0'>
                  {user.addr} 4354354645
                </p>                
                <img className='mt-1' src="wallet1.png" width="50%" height="50%" />
                <h5 className="mt-3 blue-font">DISCONNECT <br/> WALLET</h5>
              </Nav.Link>
            </Nav.Item>           
          </Nav>
        </div>

        <div className='col-xl-10 col-lg-9 d-flex pb-2'>
          <Tab.Content className='w-100'>
            {step === "default" &&
            <Tab.Pane eventKey="first">
              <div className='row'>
                <div className='col-xl-3 col-lg-5'>
                  <Card className="text-center">
                    <Card.Img className='item-img' variant="top" src="safe.png" />
                    <Card.Body>
                      <Card.Title className="blue-font">Lorem ipsum dolor</Card.Title>
                      <p className='text-grey mb-0'>
                        {user.addr}
                      </p>
                      <p className='font-14 mb-0 blue-font'>Created on</p>
                      <p className='mb-1 blue-font'>12 March 2023</p>

                      <p className='red-font font-14 mb-0'>Maturity Date</p>
                      <p className='red-font'>3 Jan 2027</p>

                      <Button variant="dark" size="sm" className='blue-bg me-5' onClick={() => setStep("edit")}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" className='red-bg'>
                        Remove
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              </div> 

              <div className='row justify-content-end mt-5'>
                <div className='col-xl-3 col-lg-5 text-center cursor-pointer' onClick={() => setStep("create")}>
                  <FaPlus className='blue-font mt-5 me-2' size={60} />
                  <h5 className='mt-3 blue-font'>CREATE NEW BACKUP</h5>
                </div>
              </div>             
            </Tab.Pane>
            }

            {step === "create" &&
            <Tab.Pane eventKey="first">
              <div className='row p-3'>
                <div className='col-md-6'>
                  <h4 className='blue-font mb-4'>
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
                  <div className='d-flex justify-content-center'>
                    <img src="page-3-banner.png" width="80%" height="auto" />
                  </div>                  
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

                    <Button className='blue-bg border-radius-none mt-4' onClick={() => setStep("edit")}>
                      CREATE BACKUP
                    </Button>
                  </Form>
                </div>
              </div>
            </Tab.Pane>
            }

            {step === "edit" &&
            <Tab.Pane eventKey="first">
              <div className='row p-3 mb-3'>
                <div className='col-md-6'>
                  <div className='row'>
                    <div className='col-md-3 d-flex green-border'>
                      <img src="safe.png" width="100%" height="auto" />
                    </div>

                    <div className='col-md-9'>
                      <h5 className='blue-font'>Lorem ipsum dolor</h5>
                      <p className='blue-font mb-0'>Lorem ipsum dolor Lorem ipsum dolor</p>
                      <p className='blue-font mb-1'>Lorem ipsum dolor Lorem ipsum dolor</p>
                      <p className='text-grey'>{user.addr}</p>
                    </div>
                  </div>
                </div>

                <div className='col-md-6 text-webkit-right'>
                  <p className='font-bold backup-date blue-font'>
                    BACKUP DATE: 12-08-2024
                  </p>

                  <p className='font-bold maturity-date blue-bg border-none'>
                    MATURITY DATE: 1-08-2028
                  </p>                  
                </div>
              </div>

              <h4 className='p-2 border-bottom-green blue-font mt-5'>COIN(S)</h4>
              <div className='d-flex mt-4'>
                <div className='backup-date p-3 cursor-pointer' onClick={() => setStep("coins")}>
                  <FaPlus className='blue-font' size={40} />
                </div>
                <h5 className='blue-font mx-3 align-self-center'>
                  ADD COIN(S) TO BACKUP
                </h5>
              </div> 

              <h4 className='p-2 border-bottom-green blue-font mt-5'>NFT COLLECTION(S)</h4>
              <div className='d-flex mt-4'>
                <div className='backup-date p-3 cursor-pointer' onClick={() => setStep("nftcollection")}>
                  <FaPlus className='blue-font' size={40} />
                </div>
                <h5 className='blue-font mx-3 align-self-center'>
                  ADD NFT(S) TO BACKUP
                </h5>
              </div>             
            </Tab.Pane>
            }

            {step === "coins" &&
            <Tab.Pane eventKey="first">
              <h4 className='blue-font p-2 border-bottom-green'>COIN(S)</h4>
              <div className='row p-3'>                
                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(250)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>                

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="coin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>                  
                </div>
              </div>

              <div className='row p-3'>                
                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="coin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(250)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>                

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="coin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>                  
                </div>
              </div>

              <div className='row p-3'>                
                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="coin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(250)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>                

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='grey-border p-2'>
                    <div className='row'>
                      <div className='col-md-3'>
                        <img src="coin.png" width="100%" height="auto" />
                        <h5 className='text-center'>(150)</h5>
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font mb-0'>Lorem ipsum dolor</h5>
                        <p className='text-grey mb-1'>{user.addr}</p>
                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                      </div>
                    </div>
                  </div>                  
                </div>
              </div>

              <div className='row mt-3 p-3'>
                <div className='col-md-8'>
                  <h5 className='text-danger'>
                    * If you don’t enter quantity of Coin(s) to handover, whole ownership of
                    the Coin(s) will goes to recipient.
                  </h5>
                </div>

                <div className='col-md-4'>
                  <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => setStep("edit")}>
                    ADD COINS TO BACKUP
                  </Button>
                </div>
              </div>
            </Tab.Pane>
            }

            {step === "nftcollection" &&
            <Tab.Pane eventKey="first">
              <h4 className='blue-font p-2 border-bottom-green'>SELECT NFT COLLECTION(S)</h4>

              <div className='row'>
                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1 cursor-pointer' onClick={() => setStep("nfts")}>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>                      
                    </Card.Body>
                  </Card>
                </div>

                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1'>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>

                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1'>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>
              </div>

              <div className='row'>
                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1'>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>

                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1'>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>

                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1'>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <Card.Title>Lorem ipsum dolor</Card.Title>
                          <div className='d-flex'>
                            <p className='text-grey font-14 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>

                            <Form.Check className='mx-2 mt-2' type="checkbox" />
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Tab.Pane>
            }

            {step === "nfts" && 
            <Tab.Pane eventKey="first">
              <div className='row pt-2 mx-2 border-bottom-green'>
                <div className='col-md-4'>
                  <h4 className='blue-font'>SELECT NFT(S)</h4>
                </div>
                <div className='col-md-4 pt-2'>
                  <Form.Check type="checkbox" label="Select All NFTs" />
                </div>
                <div className='col-md-4 text-end'>
                  <h4 className='blue-font'>NFT COLLECTION(S)</h4>
                </div>                
              </div>

              <div className='row p-3'>
                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>
              </div>

              <div className='row p-3'>
                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>
              </div>  

              <div className='row p-3'>
                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>

                <div className='col-md-4'>
                  <div className='row grey-border p-2 me-2 mt-2'>
                    <div className='col-3 p-1'>
                      <img className='green-border' src="nft.png" width="100%" height="auto" />
                    </div>

                    <div className='col-9'>
                      <Card.Title>NFT NAME</Card.Title>
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>
              </div>

              <Button className='blue-bg border-none border-radius-none mt-5 me-3'>
                ADD NFT(S) TO BACKUP
              </Button>
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