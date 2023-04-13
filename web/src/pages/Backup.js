import { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import { Tab, Nav, Card, Button, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createLockUp } from '../cadence/transaction/createLockUp';
import { getAccountLockUp } from '../cadence/script/getAccountLockUp';
import { getFungibleTokenInfoMapping } from '../cadence/script/getFungibleTokenInfoMapping';
import { lockFungibleToken } from '../cadence/transaction/lockFungibleToken';
import { setLockUpBalance } from '../cadence/transaction/setLockUpBalance';
import { getNonFungibleTokenInfoMapping } from '../cadence/script/getNonFungibleTokenInfoMapping';
import { getCollectionsForAccount } from '../cadence/script/getCollectionsForAccount';
import { getNFTsForAccountCollection } from '../cadence/script/getNFTsForAccountCollection';
import { lockNonFungibleToken } from '../cadence/transaction/lockNonFungibleToken';
import { initCollectionTemplate } from '../cadence/transaction/initCollectionTemplate';

import { getLockUpsByRecipient } from '../cadence/script/getLockUpsByRecipient';

export default function Backup() {
  const [user, setUser] = useState({ loggedIn: null });
  const [step, setStep] = useState("default");
  const [pledgeStep, setPledgeStep] = useState("default");
  const navigate = useNavigate();

  const [backupName, setBackupName] = useState('');
  const [recipient, setRecipient] = useState('0xd01ffe52e7bf2b25');
  const [maturity, setMaturity] = useState(new Date());
  const [description, setDescription] = useState('');

  const [lockUp, setLockUp] = useState(null);
  const [ft, setFT] = useState(null);
  const [flowID, setFlowID] = useState(null);
  const [blpID, setBLPID] = useState(null);
  const [flowAmount, setFlowAmount] = useState("");

  const [flowSelect, setFlowSelect] = useState(false);
  const [blpSelect, setBLPSelect] = useState(false);

  const [collection, setCollection] = useState(null);
  const [contractName, setContractName] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [nft, setNFT] = useState([]);
  const [nftIDs, setNFTIDs] = useState([]);

  //pledges
  const [pledge, setPledge] = useState(null);
  const [pledgeItem, setPledgeItem] = useState(null);

  useEffect(() => { 
    fcl.currentUser.subscribe(setUser);
    setStep("default");
    setPledgeStep("default");
  }, []); 

  useEffect(() => {
    getBackup();
  }, [user]);

  useEffect(() => {
    if(ft !== null){
      Object.keys(ft).map((key) => {
        if(key.includes("FlowToken")) setFlowID(key);
        if(key.includes("BlpToken")) setBLPID(key);
      });
    }    
  }, [ft]);

  const logout = () => {
    fcl.unauthenticate();
    navigate("/");
  }

  const convertDate = (timeStamp) => {
    const date = new Date(timeStamp);

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${month}-${day}-${year}`;

    return formattedDate;
  }

  const getBackup = async() => {
    if(user.addr){
      const res = await fcl.query({
        cadence: getAccountLockUp,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });  
      setLockUp(res);      
      console.log('lockup - ', res);

      const ftinfo = await fcl.query({
        cadence: getFungibleTokenInfoMapping
      });
      setFT(ftinfo);
      // console.log("ftinfo - ", ftinfo);

      const nftinfo = await fcl.query({
        cadence: getNonFungibleTokenInfoMapping
      });
      console.log("nftinfo - ", nftinfo);

      // const collection = await fcl.query({
      //   cadence: getCollectionsForAccount,
      //   args: (arg, t) => [arg(user.addr, t.Address)],
      // });
      // console.log('collection - ', collection);
      // setCollection(collection);
      // setContractName(collection[0].contractName);
      // setContractAddress(collection[0].contractAddress);

      // // Object.keys(nftinfo).map((item) => {
      // //   console.log('nftinfo - ', item);
      // // });

      const nft = await fcl.query({
        cadence: getNFTsForAccountCollection,
        args: (arg, t) => [
          arg(user.addr, t.Address),
          arg("TheMonsterMakerCollection", t.String)
          // arg("TheKittyItemsCollection", t.String)
        ],
      });
      setNFT(nft);
      console.log('nft - ', nft);

      const pledge = await fcl.query({
        cadence: getLockUpsByRecipient,
        args: (arg, t) => [
          arg(user.addr, t.Address),
        ],
      });
      console.log('pledge - ', pledge);
      setPledge(pledge);
    }
  }

  const createBackup = async () => {
    const releaseDate = maturity.getTime();

    try{
      const txid = await fcl.mutate({
        cadence: createLockUp,
        args: (arg, t) => [
          arg(releaseDate, t.UInt64),
          arg(recipient, t.Address),
          arg(backupName, t.String),
          arg(description, t.String)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      toast.success("Successfully created!");
      setStep("default");
    }catch(error) {
      console.log('err', error);
      toast.error(error);
    }
  }

  const selectFT = (e, id) => {
    if(id === 0){
      setFlowSelect(e.target.checked);
    }else if(id === 1){
      setBLPSelect(e.target.checked);
    }
  }

  const addFT = async () => {
    if(flowSelect){
      try{
        const txid = await fcl.mutate({
          cadence: lockFungibleToken,
          args: (arg, t) => [
            arg(flowID, t.String)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
      }catch(error) {
        console.log('err', error);
      }

      if(flowAmount !== ""){
        try{
          const txid = await fcl.mutate({
            cadence: setLockUpBalance,
            args: (arg, t) => [
              arg(flowID, t.String),
              arg(flowAmount+".0", t.UFix64)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });
    
          console.log(txid);
        }catch(error) {
          console.log('err', error);
        }
      }
    }

    if(blpSelect){
      try{
        const txid = await fcl.mutate({
          cadence: lockFungibleToken,
          args: (arg, t) => [
            arg(blpID, t.String)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
      }catch(error) {
        console.log('err', error);
      }
    }
  }

  const selectNFT = (e, id) => {
    let ids = nftIDs;

    if(e.target.checked){
      if(!ids.includes(id)) ids.push(id);
    }else{
      if(ids.includes(id))  ids = ids.filter(item => item !== id)
    }

    setNFTIDs(ids);
  }

  const addNFT = async () => {
    try{
      const txid = await fcl.mutate({
        cadence: initCollectionTemplate(contractName, contractAddress),
        args: (arg, t) => [
          arg("A.fd3d8fe2c8056370.MonsterMaker", t.String)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
    }catch(error){
      console.log('err', error);
    }

    // try{
    //   const txid = await fcl.mutate({
    //     cadence: lockNonFungibleToken,
    //     args: (arg, t) => [
    //       arg("A.fd3d8fe2c8056370.MonsterMaker", t.String),
    //       arg(nftIDs, t.Array(t.UInt64))
    //     ],
    //     proposer: fcl.currentUser,
    //     payer: fcl.currentUser,
    //     authorizations: [fcl.currentUser],
    //     limit: 999,
    //   });

    //   console.log(txid);
    //   toast.success("Successfully added!");
    // }catch(error) {
    //   console.log('err', error);
    //   toast.error(error);
    // }
  }

  //Pledges
  const clickPledge = (item) => {
    setPledgeItem(item);
    setPledgeStep("item");
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
              <Nav.Link eventKey="second" className="text-center" onClick={() => setPledgeStep("default")}>
                <img src="pleages.png" width="80%" height="80%" />
                <h5 className='mt-3 blue-font'>PLEDGES</h5>
              </Nav.Link>
            </Nav.Item>      

            <Nav.Item className="type" onClick={() => logout()}>
              <Nav.Link eventKey="third" className="text-center">
                <p className='text-grey mb-0'>
                  {user.addr}
                </p>                
                <img className='mt-1' src="wallet1.png" width="50%" height="50%" />
                <h5 className="mt-3 blue-font">DISCONNECT <br/> WALLET</h5>
              </Nav.Link>
            </Nav.Item>           
          </Nav>
        </div>

        <div className='col-xl-10 col-lg-9 d-flex pb-2'>
          <Tab.Content className='w-100'>
            <>
              {step === "default" &&
              <Tab.Pane eventKey="first">
                {lockUp ? 
                <div className='center-pad'>
                  <div className='row justify-content-center'>
                    <div className='col-xl-3 col-lg-5'>
                      <Card className="text-center" >
                        <Card.Img className='item-img cursor-pointer' variant="top" src="safe.png" 
                          onClick={() => setStep("detail")} />
                        <Card.Body>
                          <Card.Title className="blue-font">
                            {lockUp.name}
                          </Card.Title>
                          <p className='text-grey mb-0'>
                            {lockUp.recipient}
                          </p>
                          <p className='font-14 mb-0 blue-font'>
                            Created on
                          </p>
                          <p className='mb-1 blue-font'>
                            {convertDate(Math.floor(lockUp.createdAt*1000))}
                          </p>
                          <p className='red-font font-14 mb-0'>
                            Maturity Date
                          </p>
                          <p className='red-font'>
                            {convertDate(Math.floor(lockUp.releasedAt))}
                          </p>

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
                </div>
                :
                <div className='center-pad'>              
                  <div className='row justify-content-center'>
                    <div className='col-xl-3 col-lg-5 text-center cursor-pointer' onClick={() => setStep("create")}>
                      <FaPlus className='blue-font mt-5 me-2' size={60} />
                      <h5 className='mt-3 blue-font'>CREATE NEW BACKUP</h5>
                    </div>
                  </div>
                </div>
                }         
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
                        <Form.Control type="text" value={backupName} 
                          onChange={(e) => setBackupName(e.target.value)} />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Recipient's Wallet ID <span className='text-danger'>*</span>
                        </Form.Label>
                        <Form.Control type="text" value={recipient}
                        onChange={(e) => setRecipient(e.target.value)} />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Maturity Date <span className='text-danger'>*</span>
                        </Form.Label>
                        <DatePicker className='form-control' selected={maturity} onChange={(date) => setMaturity(date)} />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} value={description} 
                        onChange={(e) => setDescription(e.target.value)} />
                      </Form.Group>

                      <Button className='blue-bg border-radius-none mt-5' onClick={createBackup}>
                        CREATE BACKUP
                      </Button>
                    </Form>
                  </div>
                </div>
              </Tab.Pane>
              }

              {step === "detail" &&
              <Tab.Pane eventKey="first">
                <div className='row p-3 mb-3'>
                  <div className='col-md-6'>
                    <div className='row'>
                      <div className='col-md-3 d-flex green-border'>
                        <img src="safe.png" width="100%" height="auto" />
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font'>{lockUp.name}</h5>
                        <p className='blue-font mb-0'>{lockUp.description}</p>
                        <p className='text-grey'>{lockUp.recipient}</p>
                      </div>
                    </div>
                  </div>

                  <div className='col-md-6 text-webkit-right'>
                    <p className='font-bold backup-date blue-font'>
                      BACKUP DATE: {convertDate(Math.floor(lockUp.createdAt))}
                    </p>

                    <p className='font-bold maturity-date blue-bg border-none'>
                      MATURITY DATE: {convertDate(Math.floor(lockUp.releasedAt))}
                    </p>                  
                  </div>
                </div>
                
                <h4 className='p-2 border-bottom-green blue-font mt-4'>COIN(S)</h4>
                {lockUp !== null && lockUp.fungibleTokens.length > 0 ?
                <div className='row'>
                  {lockUp.fungibleTokens.map((item, index) => (
                    <>
                    {item.identifier.includes("FlowToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>({parseInt(item.balance)})</p>
                      </div>
                    }

                    {item.identifier.includes("BlpToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="coin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>(0)</p>
                      </div>
                    }
                    </>
                    )       
                  )}
                </div>
                :
                <div className='d-flex mt-4'>
                  <div className='backup-date p-3 cursor-pointer' onClick={() => setStep("coins")}>
                    <FaPlus className='blue-font' size={40} />
                  </div>
                  <h5 className='blue-font mx-3 align-self-center'>
                    ADD COIN(S) TO BACKUP
                  </h5>
                </div>
                }

                <h4 className='p-2 border-bottom-green blue-font mt-4'>NFT COLLECTION(S)</h4>
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

              {step === "edit" &&
              <Tab.Pane eventKey="first">
                <div className='row p-3 mb-3'>
                  <div className='col-md-6'>
                    <div className='row'>
                      <div className='col-md-3 d-flex green-border'>
                        <img src="safe.png" width="100%" height="auto" />
                      </div>

                      <div className='col-md-9'>
                        <h5 className='blue-font'>{lockUp.name}</h5>
                        <p className='blue-font mb-0'>{lockUp.description}</p>
                        <p className='text-grey'>{lockUp.recipient}</p>
                      </div>
                    </div>
                  </div>

                  <div className='col-md-6 text-webkit-right'>
                    <p className='font-bold backup-date blue-font'>
                      BACKUP DATE: {convertDate(Math.floor(lockUp.createdAt))}
                    </p>

                    <p className='font-bold maturity-date blue-bg border-none'>
                      MATURITY DATE: {convertDate(Math.floor(lockUp.releasedAt))}
                    </p>                  
                  </div>
                </div>
                
                <h4 className='p-2 border-bottom-green blue-font mt-4'>
                  COIN(S)
                  <Button className='mx-3' variant="danger" size="sm" 
                  onClick={() => setStep("removecoins")}>
                    Edit
                  </Button>
                </h4>
                {lockUp !== null && lockUp.fungibleTokens.length > 0 ?
                <div className='row'>
                  {lockUp.fungibleTokens.map((item, index) => (
                    <>
                    {item.identifier.includes("FlowToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>({parseInt(item.balance)})</p>
                      </div>
                    }

                    {item.identifier.includes("BlpToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="coin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>(0)</p>
                      </div>
                    }
                    </>
                    )       
                  )}
                </div>
                :
                <div className='d-flex mt-4'>
                  <div className='backup-date p-3 cursor-pointer' onClick={() => setStep("coins")}>
                    <FaPlus className='blue-font' size={40} />
                  </div>
                  <h5 className='blue-font mx-3 align-self-center'>
                    ADD COIN(S) TO BACKUP
                  </h5>
                </div>
                }     

                <h4 className='p-2 border-bottom-green blue-font mt-4'>
                  NFT COLLECTION(S)
                  <Button className='mx-3' variant="danger" size="sm">Edit</Button>
                </h4>
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
                {ft !== null && 
                  Object.keys(ft).map((key, index) => (
                    <div className='col-md-4' key={index} >
                      <div className='grey-border p-2'>
                        <div className='row'>
                          <div className='col-md-3'>
                            { ft[key].name === 'FLOW' ?
                              <img src="flowcoin.png" width="100%" height="auto" />
                            :
                              <img src="coin.png" width="100%" height="auto" />
                            }
                            
                            <h5 className='text-center'>(0)</h5>
                          </div>

                          <div className='col-md-9'>
                            <div className='d-flex justify-content-between'>
                              <h5 className='blue-font mb-0'>{ft[key].name}</h5>
                              <Form.Check className='mx-2' type="checkbox" onClick={(e) => selectFT(e, index)}/>
                            </div>
                            
                            <p className='text-grey mb-1'>{key}</p>
                            {ft[key].name === "FLOW" ?
                            <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' 
                            value={flowAmount} onChange={(e) => setFlowAmount(e.target.value)} />
                            :
                            <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                            }                          
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
                </div>

                <div className='row mt-3 p-3'>
                  <div className='col-md-8'>
                    <h5 className='text-danger'>
                      * If you don’t enter quantity of Coin(s) to handover, whole ownership of
                      the Coin(s) will goes to recipient.
                    </h5>
                  </div>

                  <div className='col-md-4'>
                    <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => addFT()}>
                      ADD COINS TO BACKUP
                    </Button>
                  </div>
                </div>
              </Tab.Pane>
              }
              {step === "removecoins" &&
              <Tab.Pane eventKey="first">
                <h4 className='blue-font p-2 border-bottom-green'>EDIT COIN(S)</h4>
                <div className='row p-3'>
                {lockUp !== null && 
                  lockUp.fungibleTokens.map((item, index) => (
                    <div className='col-md-4' key={index} >
                      <div className='grey-border p-2'>
                        <div className='row'>
                          <div className='col-md-3'>
                            {item.identifier.includes("FlowToken")  ?
                              <img src="flowcoin.png" width="100%" height="auto" />
                            :
                              <img src="coin.png" width="100%" height="auto" />
                            }
                            
                            {item.balance ?
                            <h5 className='text-center'>({parseInt(item.balance)})</h5>
                            :
                            <h5 className='text-center'>(0)</h5>
                            }

                            
                          </div>

                          <div className='col-md-9'>
                            <div className='d-flex justify-content-between'>
                              {item.identifier.includes("FlowToken") ?
                              <h5 className='blue-font mb-0'>FLOW</h5>
                              :
                              <h5 className='blue-font mb-0'>BLP</h5>
                              }
                              
                              <img src="remove-button.png" alt="" width="20px" height="20px" />
                            </div>
                            
                            <p className='text-grey mb-1'>{item.identifier}</p>
                            <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' 
                            onChange={(e) => setFlowAmount(e.target.value)} />                                                    
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
                </div>

                <div className='d-flex p-2 mt-5'>
                  <img className='mx-2 mt-1' src="remove-button.png" alt="" width="20px" height="20px" />
                  <h5>= Remove from the Coin(s)</h5>
                </div>

                <div className='row p-3 pt-0'>
                  <div className='col-md-8'>
                    <h5 className='text-danger'>
                      * If you don’t enter quantity of Coin(s) to handover, whole ownership of
                      the Coin(s) will goes to recipient.
                    </h5>
                  </div>

                  <div className='col-md-4'>
                    <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => addFT()}>
                      SAVE CHANGES TO COIN(S)
                    </Button>
                  </div>
                </div>
              </Tab.Pane>
              }

              {step === "nftcollection" &&
              <Tab.Pane eventKey="first">
                <h4 className='blue-font p-2 border-bottom-green'>SELECT NFT COLLECTION(S)</h4>

                <div className='row'>
                  {collection && collection.map((item, index) => (
                    <div className='col-md-4 pt-2' key={index}>
                      <Card className='p-3 pb-1 cursor-pointer' onClick={() => setStep("nfts")}>
                        <Card.Img variant="top" src={item.collectionBannerImage} />
                        <Card.Body className='pb-0'>
                          <div className='row'>
                            <div className='col-3 p-0'>
                              <img className='nft-img' src={item.collectionSquareImage} width="100%" height="auto" />
                              <h5 className='text-center'>({item.nftsCount})</h5>
                            </div>

                            <div className='col-9'>
                              <Card.Title>{item.collectionName}</Card.Title>
                              <div className='d-flex'>
                                <p className='text-grey font-14 mb-0'>
                                  {item.collectionDescription}
                                </p>

                                <Form.Check className='mx-2 mt-2' type="checkbox" />
                              </div>                          
                            </div>
                          </div>                      
                        </Card.Body>
                      </Card>
                    </div>         
                  ))}
                </div>

                <div className='row'>

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
                  {nft.length > 0 && nft.map((item, index) => (
                    <div className='col-md-4' key={index}>
                      <div className='row grey-border p-2 me-2 mt-2'>
                        <div className='col-3 p-1'>
                          <img className='green-border' src={item.thumbnail} width="100%" height="auto" />
                        </div>

                        <div className='col-9'>
                          <div className='d-flex justify-content-between'>
                            <Card.Title>{item.name}</Card.Title>
                            <Form.Check type="checkbox" onClick={(e) => selectNFT(e, item.id)}/>
                          </div> 
                          
                          <p className='font-14 mb-0'>
                            {item.description}
                          </p>
                          <p className='text-grey mb-0'>#{item.id}</p>                       
                        </div>
                      </div>
                    </div>
                  ))}                
                </div>

                <Button className='blue-bg border-none border-radius-none mt-5 me-3' onClick={() => addNFT()}>
                  ADD NFT(S) TO BACKUP
                </Button>
              </Tab.Pane>
              }         
            </>

            {/* Pledge */}
            {pledgeStep === "default" &&
              <Tab.Pane eventKey="second">
                  <div className='row'>
                  {pledge && pledge.map((item, index) =>(           
                    <div className='col-xl-3 col-lg-5' key={index}>
                      <Card className="text-center cursor-pointer" onClick={() => clickPledge(item)}>
                        <Card.Img className='item-img' variant="top" src="pleages.png" />
                        <Card.Body className='p-0'>
                          <Card.Title className="blue-font">{item.name}</Card.Title>
                          <p className='text-grey mb-0'>
                            {item.holder}
                          </p>
                          <p className='font-14 mb-0 blue-font'>Created on</p>
                          <p className='mb-1 blue-font'>
                          {convertDate(Math.floor(item.createdAt*1000))}
                          </p>

                          <p className='red-font font-14 mb-0'>Maturity Date</p>
                          <p className='red-font'>
                          {convertDate(Math.floor(item.releasedAt))}
                          </p>
                        </Card.Body>
                      </Card>
                    </div>                  
                  ))}
                </div>

                {pledge && pledge.length === 0 &&
                <div className='center-pad text-center'>
                  <h1>There's no pledges</h1>
                </div>
                }              
              </Tab.Pane>
            }

            {pledgeStep === "item" &&
            <Tab.Pane eventKey="second">
              <div className='row p-3 mb-3'>
                <div className='col-md-6'>
                  <div className='row'>
                    <div className='col-md-3 d-flex green-border'>
                      <img src="pleages.png" width="100%" height="auto" />
                    </div>

                    <div className='col-md-9'>
                      <h5 className='blue-font'>{pledgeItem.name}</h5>
                      <p className='blue-font mb-0'>{pledgeItem.description}</p>
                      <p className='text-grey'>{pledgeItem.holder}</p>
                    </div>
                  </div>
                </div>

                <div className='col-md-6 text-webkit-right'>
                  <p className='font-bold maturity-date blue-bg border-none'>
                    MATURITY DATE: {convertDate(Math.floor(pledgeItem.releasedAt))}
                  </p>                  
                </div>
              </div>

              <h4 className='p-2 border-bottom-green blue-font'>
                COIN(S)
                <Button className='mx-3' variant="danger" size="sm" onClick={() => setPledgeStep("coins")}>
                  WITHDRAW
                </Button>
              </h4>
              {pledgeItem !== null && pledgeItem.fungibleTokens.length > 0 ?
                <div className='row'>
                  {pledgeItem.fungibleTokens.map((item, index) => (
                    <>
                    {item.identifier.includes("FlowToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="flowcoin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>({parseInt(item.balance)})</p>
                      </div>
                    }

                    {item.identifier.includes("BlpToken") &&
                      <div className='col-md-1' key={index}>
                        <img src="coin.png" width="100%" height="auto" />
                        <p className='blue-font font-bold text-center'>(0)</p>
                      </div>
                    }
                    </>
                    )       
                  )}
                </div>
                :
                <div className='d-flex mt-4 mb-5'>
                  <h5 className='blue-font mx-3 align-self-center'>
                    NO COIN(S)
                  </h5>
                </div>
              }

              <h4 className='p-2 border-bottom-green blue-font'>
                NFT COLLECTION(S)
                <Button className='mx-3' variant="danger" size="sm">WITHDRAW</Button>
              </h4>
              <div className='row'>
                <div className='col-md-3 pt-2'>
                  <Card className='p-2 pb-1 cursor-pointer' onClick={() => setPledgeStep("nftcollection")}>
                    <Card.Img variant="top" src="nfts.png" />
                    <Card.Body className='pb-0'>
                      <div className='row'>
                        <div className='col-3 p-0'>
                          <img className='nft-img' src="nft.png" width="100%" height="auto" />
                          <h5 className='text-center'>(7)</h5>
                        </div>

                        <div className='col-9'>
                          <p className='font-bold font-15 mb-0'>Lorem ipsum dolor</p>
                          <div className='d-flex'>
                            <p className='text-grey font-12 mb-0'>
                              Lorem ipsum dolor Lorem <br/>
                              Lorem ipsum dolor Lorem
                            </p>
                          </div>                          
                        </div>
                      </div>                      
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Tab.Pane>
            }

            {pledgeStep === "coins" &&
            <Tab.Pane eventKey="second">
              <h4 className='p-2 border-bottom-green blue-font'>
                WITHDRAW COIN(S) FROM PLEDGE
              </h4>

              {pledgeItem !== null && pledgeItem.fungibleTokens.length > 0 &&
              <div className='row p-3'>      
                {pledgeItem.fungibleTokens.map((item, index) => (
                  <>
                  {item.identifier.includes("FlowToken") &&
                    <div className='col-md-4'>
                      <div className='grey-border p-2'>
                        <div className='row'>          
    
                          <div className='col-md-3'>
                            <img src="flowcoin.png" width="100%" height="auto" />
                            <h5 className='text-center'>({parseInt(item.balance)})</h5>
                          </div>
    
                          <div className='col-md-9'>
                            <h5 className='blue-font mb-0'>FLOW</h5>
                            <p className='text-grey mb-1'>{pledgeItem.holder}</p>
                            
                            <div className='row'>
                              <div className='col-9 pr-0'>
                                <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                              </div>
    
                              <div className='col-3'>
                                <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                              </div>
                            </div>                        
                          </div>
    
                        </div>
                      </div>
                    </div>
                  }

                  {item.identifier.includes("BlpToken") &&
                    <div className='col-md-4'>
                      <div className='grey-border p-2'>
                        <div className='row'>          
    
                          <div className='col-md-3'>
                            <img src="coin.png" width="100%" height="auto" />
                            <h5 className='text-center'>(0)</h5>
                          </div>
    
                          <div className='col-md-9'>
                            <h5 className='blue-font mb-0'>BLP</h5>
                            <p className='text-grey mb-1'>{pledgeItem.holder}</p>
                            
                            <div className='row'>
                              <div className='col-9 pr-0'>
                                <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)' />
                              </div>
    
                              <div className='col-3'>
                                <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                              </div>
                            </div>                        
                          </div>
    
                        </div>
                      </div>
                    </div>
                  } 
                  </>
                )
                )}                
              </div>
              }
            </Tab.Pane>
            }

            {pledgeStep === "nftcollection" &&
            <Tab.Pane eventKey="second">
              <h4 className='p-2 border-bottom-green blue-font'>
                SELECT NFT COLLECTION TO WITHDRAW NFT(S)
              </h4>

              <div className='row'>
                <div className='col-md-4 pt-2'>
                  <Card className='p-3 pb-1 cursor-pointer' onClick={() => setPledgeStep("nfts")}>
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
                          </div>                          
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Tab.Pane>
            }

            {pledgeStep === "nfts" &&
            <Tab.Pane eventKey="second">
              <div className='row pt-2 mx-2 border-bottom-green'>
                <div className='col-md-6'>
                  <h4 className='blue-font'>
                    WITHDRAW NFT(S) FROM PLEDGE
                  </h4>
                </div>
                <div className='col-md-6 text-end'>
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
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
                      <div className='row'>
                        <div className='col-9'>
                          <Card.Title>NFT NAME</Card.Title>
                        </div>
                        <div className='col-3'>
                          <img className='withdraw-img p-1' src="withdraw-icon.png" width="100%" height="auto" />
                        </div>
                      </div>                     
                      
                      <p className='font-14 mb-0'>
                        Lorem ipsum dolor Lorem <br/>
                        Lorem ipsum dolor Lorem
                      </p>
                      <p className='text-grey mb-0'>#567</p>                       
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Pane>
            }            
          </Tab.Content>
        </div>        
      </div>

      <ToastContainer />
    </Tab.Container>
  )
}
