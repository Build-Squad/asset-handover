import React, { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import { Tab, Nav, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowLeft, FaInfo } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createLockUp } from '../cadence/transaction/createLockUp';
import { updateLockUp } from '../cadence/transaction/updateLockUp';
import { destroyLockup } from '../cadence/transaction/destroyLockup';
import { getAccountLockUp } from '../cadence/script/getAccountLockUp';
import { getFungibleTokenInfoMapping } from '../cadence/script/getFungibleTokenInfoMapping';
import { lockFungibleToken } from '../cadence/transaction/lockFungibleToken';
import { lockFungibleTokens } from '../cadence/transaction/lockFungibleTokens';
import { setLockUpBalance } from '../cadence/transaction/setLockUpBalance';
import { getNonFungibleTokenInfoMapping } from '../cadence/script/getNonFungibleTokenInfoMapping';
import { getCollectionsForAccount } from '../cadence/script/getCollectionsForAccount';
import { getNFTsForAccountCollection } from '../cadence/script/getNFTsForAccountCollection';
import { initCollectionTemplate } from '../cadence/transaction/initCollectionTemplate';
import { setLockUpNFTIDs } from '../cadence/transaction/setLockUpNFTIDs';
import { lockNonFungibleToken } from '../cadence/transaction/lockNonFungibleToken';

import { getLockUpsByRecipient } from '../cadence/script/getLockUpsByRecipient';
import { setupAddVaultAndWithdrawFT } from '../cadence/transaction/setupAddVaultAndWithdrawFT';
import { withdrawNonFungibleToken } from '../cadence/transaction/withdrawNonFungibleToken';

import NftId from '../components/NftId';
import AddNftId from '../components/AddNftId';

export default function Backup() {
  const [user, setUser] = useState({ loggedIn: null, addr: '' });
  const [step, setStep] = useState("default");
  const [pledgeStep, setPledgeStep] = useState("default");
  const navigate = useNavigate();
  const [txId, setTxId] = useState('');
  const [txStatus, setTxStatus] = useState(null);
  const [txType, setTxType] = useState(null);
  const [txProgress, setTxProgress] = useState(false);

  //lockups
  const [backupName, setBackupName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [maturity, setMaturity] = useState(new Date());
  const [description, setDescription] = useState('');

  const [lockUp, setLockUp] = useState(null);
  const [editLockUp, setEditLockUp] = useState(false);
  const [ft, setFT] = useState(null);
  const [flowID, setFlowID] = useState(null);
  const [blpID, setBLPID] = useState(null);
  const [flowAmount, setFlowAmount] = useState("");
  const [blpAmount, setBlpAmount] = useState("");
  const [flowSelect, setFlowSelect] = useState(false);
  const [blpSelect, setBLPSelect] = useState(false);

  const [collection, setCollection] = useState(null);
  const [contractName, setContractName] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [publicType, setPublicType] = useState(null);
  const [privateType, setPrivateType] = useState(null);
  const [collectionID, setCollectionID] = useState(null);
  const [nft, setNFT] = useState([]);
  const [nftIDs, setNFTIDs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState([]);

  const [ownCollection, setOwnCollection] = useState(null);
  const [editFlowAmount, setEditFlowAmount] = useState("");
  const [editBlpAmount, setEditBlpAmount] = useState("");
  const [isRemoveFlow, setIsRemoveFlow] = useState(false);
  const [isRemoveBlp, setIsRemoveBlp] = useState(false);
  const [flowBalance, setFlowBalance] = useState(null);
  const [blpBalance, setBlpBalance] = useState(null);
  const [editNFTIDs, setEditNFTIDs] = useState([]);
  const [showNFT, setShowNFT] = useState(null);
  const [currentNFTIDs, setCurrentNFTIDs] = useState(null);

  //pledges
  const [pledge, setPledge] = useState(null);
  const [pledgeItem, setPledgeItem] = useState(null);
  const [holder, setHolder] = useState(null);
  const [flowWithdraw, setFlowWithdraw] = useState("");
  const [blpWithdraw, setBlpWithdraw] = useState("");
  const [pledgeCollection, setPledgeCollection] = useState(null);
  const [pledgeNFT, setPledgeNFT] = useState(null);
  const [withdrawNFTIDs, setWithdrawNFTIDs] = useState([]);

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
    setStep("default");
    setPledgeStep("default");
    setNFTIDs([]);
    setTxStatus(null);
  }, []);

  useEffect(() => {
    getBackup();
    if (txStatus && txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
      getBackup();
    }
  }, [user, txStatus]);

  useEffect(() => {
    if (ft !== null) {
      Object.keys(ft).map((key) => {
        if (key.includes("FlowToken")) setFlowID(key);
        if (key.includes("BlpToken")) setBLPID(key);
      });
    }
  }, [ft]);

  useEffect(() => {
    const tempOwnCollection = [];
    if (lockUp && lockUp.nonFungibleTokens.length > 0 && collection) {
      lockUp.nonFungibleTokens.map((item) => {
        collection.map((col) => {
          if (col.nftType.includes(item.identifier)) {
            tempOwnCollection.push(col);
          }
        })
      })

      setOwnCollection(tempOwnCollection);
    }

    // console.log("ownCollection - ", ownCollection);

    if (lockUp && lockUp.fungibleTokens.length > 0) {
      lockUp.fungibleTokens.map((item) => {
        if (item.identifier === "A.7e60df042a9c0868.FlowToken" && item.balance > 0) setFlowBalance(item.balance);
        if (item.identifier === "A.5d649d473cc7fa83.BlpToken" && item.balance > 0) setBlpBalance(item.balance);
      })
    }

  }, [lockUp, collection])

  useEffect(() => {
    if (txId) {
      fcl.tx(txId).subscribe(setTxStatus);
    }
  }, [txId]);

  useEffect(() => {

    if (txStatus && txType === "createLockup") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Lockup is successfully saved!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("default");
      }
    }
    else if (txStatus && txType === "destoryLockup") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Lockup is successfully destoryed!");
        setTxProgress(false);
        setTxStatus(null);
      }
    }
    else if (txStatus && txType === "addFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Fungible Token is successfully added!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("detail");
      }
    }
    else if (txStatus && txType === "addNFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("NonFungible Token is successfully added!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("detail");
      }
    }
    else if (txStatus && txType === "editFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Fungible Token is successfully edited!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("detail");
      }
    }
    else if (txStatus && txType === "removeFlow") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Flow token is successfully removed!");
        setTxProgress(false);
        setTxStatus(null);
      }
    }
    else if (txStatus && txType === "removeBlp") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Blp token is successfully removed!");
        setTxProgress(false);
        setTxStatus(null);
      }
    }
    else if (txStatus && txType === "editNFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("NonFungible Token is successfully edited!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("detail");
      }
    }
    else if (txStatus && txType === "removeNFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("NonFungible Token is successfully removed!");
        setTxProgress(false);
        setTxStatus(null);
        setStep("detail");
      }
    }

    else if (txStatus && txType === "withdrawFlow") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Flow token is successfully withdrawed!");
        setTxProgress(false);
        setTxStatus(null);
      }
    }
    else if (txStatus && txType === "withdrawBlp") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("Blp token is successfully withdrawed!");
        setTxProgress(false);
        setTxStatus(null);
      }
    }
    else if (txStatus && txType === "withdrawNFT") {
      if (txStatus.statusString === "SEALED" && txStatus.errorMessage !== "") {
        toast.error(txStatus.errorMessage);
        setTxProgress(false);
        setTxStatus(null);
      } else if (txStatus.statusString === "SEALED" && txStatus.errorMessage === "") {
        toast.success("NonFungible Token is successfully withdrawed!");
        setTxProgress(false);
        setTxStatus(null);
        setPledgeStep("item");
      }
    }

  }, [txStatus, txType]);

  useEffect(() => {
    setShowNFT(Array(nft.length).fill(true));
    const ids = [];

    nft.map((item) => {
      ids.push(item.id);
    });

    setCurrentNFTIDs(ids);
  }, [nft]);

  useEffect(() => {
    setIsRemoveBlp(false);
    setIsRemoveFlow(false);
  }, [step])

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

  const getBackup = async () => {
    if (user.addr) {
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
      // console.log("nftinfo - ", nftinfo);
      const collection = await fcl.query({
        cadence: getCollectionsForAccount,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      // console.log('collection - ', collection);
      const nftCollection = [];
      Object.keys(nftinfo).map((info) => {
        collection.map((item) => {
          if (item.nftType.includes(info)) nftCollection.push(item);
        })
      });
      console.log("nftCollection - ", nftCollection);
      setCollection(nftCollection);


      const pledge = await fcl.query({
        cadence: getLockUpsByRecipient,
        args: (arg, t) => [
          arg(user.addr, t.Address),
        ],
      });
      // console.log('pledge - ', pledge);
      setPledge(pledge);
    }
  }

  const editClick = (e) => {
    e.stopPropagation();
    setStep("create");
    setEditLockUp(true);

    setBackupName(lockUp.name);
    setRecipient(lockUp.recipient);
    setDescription(lockUp.description);
    const dateObject = new Date(parseInt(lockUp.releasedAt));
    setMaturity(dateObject);
  }

  const createBackup = async () => {
    const releaseDate = maturity.getTime().toString();
    setTxProgress(true);
    setTxType("createLockup");

    if(editLockUp){
      try {
        const txid = await fcl.mutate({
          cadence: updateLockUp,
          args: (arg, t) => [
            arg(releaseDate, t.UInt64),
            arg(backupName, t.String),
            arg(description, t.String),
            arg(recipient, t.Address)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        console.log(txid);
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }else{
      try {
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
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }
  }

  const destoryBackup = async (e) => {
    e.stopPropagation();
    setTxProgress(true);
    setTxType("destoryLockup");

    try {
      const txid = await fcl.mutate({
        cadence: destroyLockup,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      setTxId(txid);
      setStep("default");
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
    }
  }

  const selectFT = (e, id) => {
    if (id === 0) {
      setFlowSelect(e.target.checked);
    } else if (id === 1) {
      setBLPSelect(e.target.checked);
    }
  }

  const addFT = async () => {
    setTxProgress(true);
    setTxType("addFT");

    if (flowSelect) {
      if(flowAmount !== ""){
        try {
          const txid = await fcl.mutate({
            cadence: lockFungibleToken,
            args: (arg, t) => [
              arg(flowID, t.String),
              arg(flowAmount + ".0", t.UFix64)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });

          console.log(txid);
          setTxId(txid);
        } catch (error) {
          setTxProgress(false);
          toast.error(error);
        }
      }else{
        try {
          const txid = await fcl.mutate({
            cadence: lockFungibleToken,
            args: (arg, t) => [
              arg(flowID, t.String),
              arg(null, t.Optional(t.UFix64))
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });

          console.log(txid);
          setTxId(txid);
        } catch (error) {
          setTxProgress(false);
          toast.error(error);
        }
      }
    }

    if (blpSelect) {
      if(blpAmount !== ""){
        try {
          const txid = await fcl.mutate({
            cadence: lockFungibleToken,
            args: (arg, t) => [
              arg(blpID, t.String),
              arg(blpAmount + ".0", t.UFix64)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });
  
          console.log(txid);
          setTxId(txid);
        } catch (error) {
          setTxProgress(false);
          toast.error(error);
        }
      }else{
        try {
          const txid = await fcl.mutate({
            cadence: lockFungibleToken,
            args: (arg, t) => [
              arg(blpID, t.String),
              arg(null, t.Optional(t.UFix64))
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });
  
          console.log(txid);
          setTxId(txid);
        } catch (error) {
          setTxProgress(false);
          toast.error(error);
        }
      }      
    }
  }

  const selectNFTCollection = async (item) => {
    let availableNFT = [];

    const nftRes = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(user.addr, t.Address),
        arg(item.collectionIdentifier, t.String)
      ],
    });
    // console.log('nftRes - ', nftRes);

    lockUp.nonFungibleTokens.forEach((token) => {
      if(item.nftType.includes(token.identifier)){
        nftRes.map((nftItem) => {
          if(!token.nftIDs.includes(nftItem.id)) {
            availableNFT.push(nftItem);
          }
        })
        setNFT(availableNFT);
      }
    });
    // console.log("available nft - ", availableNFT);
    
    setContractName(item.contractName);
    setContractAddress(item.contractAddress);
    setPublicType(item.publicLinkedType.typeID);
    setPrivateType(item.privateLinkedType.typeID);
    setCollectionID(item.nftType);

    setStep("nfts");
  }

  const selectNFT = (e, id) => {
    let ids = [...nftIDs];

    if (e.target.checked) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    } else {
      if (ids.includes(id)) {
        ids = ids.filter(item => item !== id)
      }
    }

    setNFTIDs(ids);
  }
  
  const selectAllNFT = (e) => {
    let ids = [...nftIDs];
    let selectedIds = [];

    if(e.target.checked){
      nft.map((item) => {
        ids.push(item.id);
        selectedIds.push(true);
      });
    }else{
      ids = [];
      nft.map((item) => {
        selectedIds.push(false);
      })
    }

    setSelectedNFT(selectedIds);
    setNFTIDs(ids);
  }

  const addNFT = async () => {
    const publicVal = publicType.replace(/A\.[^\.]*\./g, '');
    const privateVal = privateType.replace(/A\.[^\.]*\./g, '');
    setTxProgress(true);
    setTxType("addNFT");

    try {
      const txid = await fcl.mutate({
        cadence: initCollectionTemplate(contractName, contractAddress, publicVal, privateVal),
        args: (arg, t) => [
          arg(collectionID.replace(".NFT", ""), t.String),
          arg(nftIDs, t.Array(t.UInt64))
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      setTxId(txid);
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
    }

  }

  const editFT = async () => {
    setTxProgress(true);
    setTxType("editFT");

    if(isRemoveFlow){
      try {
        const txid = await fcl.mutate({
          cadence: lockFungibleTokens,
          args: (arg, t) => [
            arg([{ key: blpID, value: blpBalance }], t.Dictionary({ key: t.String, value: t.Optional(t.UFix64) }))
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
        setTxId(txid);
      } catch (error) {
        toast.error(error);
        setTxProgress(false);
        setIsRemoveFlow(false);
      }
    }

    if(isRemoveBlp){
      try {
        const txid = await fcl.mutate({
          cadence: lockFungibleTokens,
          args: (arg, t) => [
            arg([{ key: flowID, value: flowBalance }], t.Dictionary({ key: t.String, value: t.Optional(t.UFix64) }))
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
        setTxId(txid);
      } catch (error) {
        toast.error(error);
        setTxProgress(false);
        setIsRemoveBlp(false);
      }
    }

    if (editFlowAmount !== "") {
      try {
        const txid = await fcl.mutate({
          cadence: setLockUpBalance,
          args: (arg, t) => [
            arg(flowID, t.String),
            arg(editFlowAmount + ".0", t.UFix64)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        console.log(txid);
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }

    if (editBlpAmount !== "") {
      try {
        const txid = await fcl.mutate({
          cadence: setLockUpBalance,
          args: (arg, t) => [
            arg(blpID, t.String),
            arg(editBlpAmount + ".0", t.UFix64)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        console.log(txid);
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }
  }

  const removeFlow = () => {
    setIsRemoveFlow(true);    
  }

  const removeBlp = () => {
    setIsRemoveBlp(true);    
  }

  const editNFTCollection = async (item) => {
    console.log("collection - ", item);

    const nft = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(user.addr, t.Address),
        arg(item.collectionIdentifier, t.String)
      ],
    });

    var ownNFTIDs = [];
    lockUp.nonFungibleTokens.map((token) => {
      if (item.nftType.includes(token.identifier)) ownNFTIDs = token.nftIDs;
    });

    var ownNFT = [];
    nft.map((nftItem) => {
      if (ownNFTIDs.includes(nftItem.id)) ownNFT.push(nftItem);
    });

    setNFT(ownNFT);
    console.log('ownnft - ', ownNFT);
    setCollectionID(item.nftType);

    setStep("removenfts");
  }

  const toggleNFTVisibility = (index, id) => {
    const newShowNFT = [...showNFT];
    newShowNFT[index] = !newShowNFT[index];
    setShowNFT(newShowNFT);

    
    console.log("currentNFTIDs", currentNFTIDs);

    currentNFTIDs.forEach((item, index) => {
      if(item === id) currentNFTIDs.splice(index, 1);
    })

    setEditNFTIDs(currentNFTIDs);
  };

  const editNFT = async () => {
    setTxProgress(true);
    setTxType("editNFT");

    if(currentNFTIDs.length > 0){
      try {
        const txid = await fcl.mutate({
          cadence: setLockUpNFTIDs,
          args: (arg, t) => [
            arg(collectionID.replace(".NFT", ""), t.String),
            arg(editNFTIDs, t.Array(t.UInt64))
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }else{
      try {
        const txid = await fcl.mutate({
          cadence: lockNonFungibleToken,
          args: (arg, t) => [
            arg(collectionID.replace(".NFT", ""), t.String),
            arg(null, t.Optional(t.Array(t.UInt64)))
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });
  
        console.log(txid);
        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }    
    }

  }


  //Pledges
  const clickPledge = async (item) => {
    setPledgeItem(item);
    console.log("pledge - ", item);
    setPledgeStep("item");
    setHolder(item.holder);

    const pledgeCollection = await fcl.query({
      cadence: getCollectionsForAccount,
      args: (arg, t) => [arg(item.holder, t.Address)]
    });
    // console.log("pledgeCollection - ", pledgeCollection);
    const nftinfo = await fcl.query({
      cadence: getNonFungibleTokenInfoMapping
    });
    const nftCollection = [];
    Object.keys(nftinfo).map((info) => {
      pledgeCollection.map((item) => {
        if (item.nftType.includes(info)) nftCollection.push(item);
      })
    });
    // console.log("nftCollection - ", nftCollection);
    setPledgeCollection(nftCollection);
  }

  const widthdrawCoins = () => {
    const currentDate = parseInt(Date.now());
    console.log(currentDate);

    if (currentDate <= pledgeItem.releasedAt) {
      toast.error("The assets are still in lock-up period");
    } else {
      setPledgeStep("coins");
    }
  }

  const withdrawFlow = async (identifier, holder) => {
    setTxProgress(true);
    setTxType("withdrawFlow");

    try {
      const txid = await fcl.mutate({
        cadence: setupAddVaultAndWithdrawFT("BlpToken", "0xAssetHandover"),
        args: (arg, t) => [
          arg(identifier, t.String),
          arg(holder, t.Address),
          arg(flowWithdraw + ".0", t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      setTxId(txid);
    } catch (error) {
      toast.error(error);
      setTxProgress(false);
    }
  }

  const withdrawBlp = async (identifier, holder) => {
    setTxProgress(true);
    setTxType("withdrawBlp");

    try {
      const txid = await fcl.mutate({
        cadence: setupAddVaultAndWithdrawFT("BlpToken", "0xAssetHandover"),
        args: (arg, t) => [
          arg(identifier, t.String),
          arg(holder, t.Address),
          arg(blpWithdraw + ".0", t.UFix64)
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      setTxId(txid);
    } catch (error) {
      toast.error(error);
      setTxProgress(false);
    }
  }

  const withdrawNFTCollection = async (item) => {
    const nft = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(holder, t.Address),
        arg(item.collectionIdentifier, t.String)
      ],
    });

    var ownNFTIDs = [];
    pledgeItem.nonFungibleTokens.map((token) => {
      if (item.nftType.includes(token.identifier)) ownNFTIDs = token.nftIDs;
    });

    var ownNFT = [];
    nft.map((nftItem) => {
      if (ownNFTIDs.includes(nftItem.id)) ownNFT.push(nftItem);
    });

    setPledgeNFT(ownNFT);
    console.log('nft - ', ownNFT);

    setCollectionID(item.nftType);

    setPledgeStep("nfts");
  }

  const selectWithdrawNFT = (e, id) => {
    let ids = [...withdrawNFTIDs];

    if (e.target.checked) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    } else {
      if (ids.includes(id)) {
        ids = ids.filter(item => item !== id)
      }
    }

    setWithdrawNFTIDs(ids);
  }

  const withdrawNFT = async () => {
    setTxProgress(true);
    setTxType("withdrawNFT");

    try {
      const txid = await fcl.mutate({
        cadence: withdrawNonFungibleToken,
        args: (arg, t) => [
          arg(collectionID.replace(".NFT", ""), t.String),
          arg(holder, t.Address),
          arg(withdrawNFTIDs, t.Array(t.UInt64))
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      console.log(txid);
      setTxId(txid);
      setWithdrawNFTIDs([]);
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
      setWithdrawNFTIDs([]);
    }
  }

  return (
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
                <p className='text-grey mb-0 font-12'>
                  {user.addr}
                </p>
                <img className='mt-1' src="wallet1.png" width="50%" height="50%" />
                <h5 className="mt-3 blue-font">DISCONNECT <br /> WALLET</h5>
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
                          <Card className="text-center cursor-pointer" onClick={() => setStep("detail")}>
                            <Card.Img className='item-img' variant="top" src="safe.png" />
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
                                {convertDate(Math.floor(lockUp.createdAt * 1000))}
                              </p>


                              {parseInt(Date.now()) >= lockUp.releasedAt ?
                              <>
                                <p className='text-success font-14 mb-0'>
                                  Maturity Date
                                </p>
                                <p className='text-success'>
                                  {convertDate(Math.floor(lockUp.releasedAt))}
                                </p>
                              </>                              
                              :
                              <>
                                <p className='red-font font-14 mb-0'>
                                  Maturity Date
                                </p>
                                <p className='red-font'>
                                  {convertDate(Math.floor(lockUp.releasedAt))}
                                </p>
                              </>                              
                              }                             

                              <Button variant="dark" size="sm" className='blue-bg me-5' onClick={(e) => editClick(e)}>
                                Edit
                              </Button>

                              {txProgress && txType === "destoryLockup" ?
                                <Button variant="danger" size="sm" className='red-bg' disabled>
                                  <Spinner animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                  </Spinner>
                                </Button>
                                :
                                <Button variant="danger" size="sm" className='red-bg' onClick={(e) => destoryBackup(e)}>
                                  Remove
                                </Button>
                              }

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

                        {txProgress && txType === "createLockup" ?
                          <Button className='blue-bg border-radius-none mt-5' disabled>
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </Spinner>
                          </Button>
                          :
                          <>
                          {editLockUp ?
                          <Button className='blue-bg border-radius-none mt-5' onClick={createBackup}>
                            SAVE CHANGES
                          </Button>
                          :
                          <Button className='blue-bg border-radius-none mt-5' onClick={createBackup}>
                            CREATE BACKUP
                          </Button>
                          }
                          </>
                        }

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
                        BACKUP DATE: {convertDate(Math.floor(lockUp.createdAt * 1000))}
                      </p>

                      <p className='font-bold maturity-date blue-bg border-none'>
                        MATURITY DATE: {convertDate(Math.floor(lockUp.releasedAt))}
                      </p>
                    </div>
                  </div>

                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='p-2 blue-font mb-0'>
                      COIN(S)
                      {lockUp !== null && lockUp.fungibleTokens.length > 0 ?
                      <Button className='mx-3' variant="danger" size="sm"
                        onClick={() => setStep("removecoins")}>
                        Edit
                      </Button>
                      :
                      <></>
                      }
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setStep("default")} />
                  </div>


                  {lockUp !== null && lockUp.fungibleTokens.length > 0 ?
                    <div className='row mt-2'>
                      {lockUp.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                          {item.identifier.includes("FlowToken") &&
                            <div className='col-md-1'>
                              <img src="flowcoin.png" width="100%" height="auto" />
                              
                              {item.balance === null ?
                              <p className='blue-font font-bold text-center'>
                                (All)
                              </p>
                              :
                              <p className='blue-font font-bold text-center'>
                                ({parseInt(item.balance)})
                              </p>
                              }
                            </div>
                          }

                          {item.identifier.includes("BlpToken") &&
                            <div className='col-md-1'>
                              <img src="coin.png" width="100%" height="auto" />
                              
                              {item.balance === null ?
                              <p className='blue-font font-bold text-center'>
                                (All)
                              </p>
                              :
                              <p className='blue-font font-bold text-center'>
                                ({parseInt(item.balance)})
                              </p>
                              }                              
                            </div>
                          }
                        </React.Fragment>
                      )
                      )}
                      <div className='col-md-1 pt-2'>
                        <div className='backup-date p-3 cursor-pointer m-auto' onClick={() => setStep("coins")}>
                          <FaPlus className='blue-font' size={40} />
                        </div>
                      </div>
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
                    {lockUp !== null && lockUp.nonFungibleTokens.length > 0 ?
                    <Button className='mx-3' variant="danger" size="sm" onClick={() => setStep("editnftcollection")}>
                      Edit
                    </Button>
                    :
                    <></>
                    }
                  </h4>
                  {lockUp !== null && lockUp.nonFungibleTokens.length > 0 ?
                    <div className='row'>
                      {ownCollection && ownCollection.map((item, index) => (
                        <div className='col-md-3 pt-2' key={index}>
                          <Card className='p-3 pb-1 h-100'>
                            <Card.Img variant="top" src={item.collectionBannerImage} />
                            <Card.Body className='pb-0'>
                              <div className='row'>
                                <div className='col-3 p-0'>
                                  <img className='nft-img' src={item.collectionSquareImage} width="100%" height="auto" />
                                  <NftId lockUp={lockUp} item={item} />
                                </div>

                                <div className='col-9'>
                                  <p className='font-bold'>{item.contractName}</p>
                                  <div className='d-flex'>
                                    <p className='text-grey font-14 mb-0'>
                                      {item.collectionDescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}

                      <div className='col-md-3 pt-2'>
                        <div className='center-pad'>
                          <div className='backup-date p-3 cursor-pointer m-auto' onClick={() => setStep("nftcollection")}>
                            <FaPlus className='blue-font' size={40} />
                          </div>
                        </div>
                      </div>
                    </div>
                    :
                    <div className='d-flex mt-4'>
                      <div className='backup-date p-3 cursor-pointer' onClick={() => setStep("nftcollection")}>
                        <FaPlus className='blue-font' size={40} />
                      </div>
                      <h5 className='blue-font mx-3 align-self-center'>
                        ADD NFT(S) TO BACKUP
                      </h5>
                    </div>
                  }

                </Tab.Pane>
              }

              {step === "coins" &&
                <Tab.Pane eventKey="first">
                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='blue-font p-2 mb-0'>
                      COIN(S)
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setStep("detail")} />
                  </div>

                  <div className='row p-3'>
                    {ft !== null &&
                      Object.keys(ft).map((key, index) => (
                        <div className='col-lg-6 col-xl-4 pt-2' key={index}>
                          <div className='grey-border p-2'>
                            <div className='row'>
                              <div className='col-md-3'>
                                {ft[key].name === 'FLOW' ?
                                  <img src="flowcoin.png" width="100%" height="auto" />
                                  :
                                  <img src="coin.png" width="100%" height="auto" />
                                }

                                <h5 className='text-center'>(0)</h5>
                              </div>

                              <div className='col-md-9'>
                                <div className='d-flex justify-content-between'>
                                  <h5 className='blue-font mb-0'>{ft[key].name}</h5>
                                  <Form.Check className='mx-2' type="checkbox" onClick={(e) => selectFT(e, index)} />
                                </div>

                                <p className='text-grey mb-1 font-14'>{key}</p>
                                {ft[key].name === "FLOW" ?
                                  <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                    value={flowAmount} onChange={(e) => setFlowAmount(e.target.value)} />
                                  :
                                  <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                    value={blpAmount} onChange={(e) => setBlpAmount(e.target.value)} />
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
                      {(!flowSelect && !blpSelect) ?
                        <Button className='blue-bg border-none border-radius-none mt-3' disabled>
                          ADD COINS TO BACKUP
                        </Button>
                        :
                        <>
                          {txProgress && txType === "addFT" ?
                            <Button className='blue-bg border-none border-radius-none mt-3' disabled>
                              <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </Spinner>
                            </Button>
                            :
                            <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => addFT()}>
                              ADD COINS TO BACKUP
                            </Button>
                          }
                        </>
                      }
                    </div>
                  </div>
                </Tab.Pane>
              }
              {step === "removecoins" &&
                <Tab.Pane eventKey="first">
                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='blue-font p-2 mb-0'>EDIT COIN(S)</h4>
                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setStep("detail")} />
                  </div>

                  <div className='row p-3'>
                    {lockUp !== null &&
                      lockUp.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                        {item.identifier.includes("FlowToken") ?
                        <>
                        {!isRemoveFlow && 
                        <div className='col-lg-6 col-xl-4 pt-2'>
                          <div className='grey-border p-2'>
                            <div className='row'>
                              <div className='col-md-3'>
                                <img src="flowcoin.png" width="100%" height="auto" />

                                {item.balance ?
                                  <h5 className='text-center'>({parseInt(item.balance)})</h5>
                                  :
                                  <h5 className='text-center'>(All)</h5>
                                }
                              </div>

                              <div className='col-md-9'>
                                <div className='d-flex justify-content-between'>
                                  <h5 className='blue-font mb-0'>FLOW</h5>

                                  {!isRemoveFlow && !isRemoveBlp && lockUp.fungibleTokens.length > 1 &&
                                    <img className='cursor-pointer' src="remove-button.png" alt="" width="20px" height="20px"
                                      onClick={() => removeFlow()} />
                                  }                                  
                                </div>

                                <p className='text-grey mb-1 font-14'>{item.identifier}</p>

                                <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                  value={editFlowAmount} onChange={(e) => setEditFlowAmount(e.target.value)} />
                              </div>
                            </div>
                          </div>
                        </div>
                        }
                        </>                        
                        :
                        <>
                        {!isRemoveBlp &&
                        <div className='col-lg-6 col-xl-4 pt-2'>
                          <div className='grey-border p-2'>
                            <div className='row'>
                              <div className='col-md-3'>
                                <img src="coin.png" width="100%" height="auto" />

                                {item.balance ?
                                  <h5 className='text-center'>({parseInt(item.balance)})</h5>
                                  :
                                  <h5 className='text-center'>(All)</h5>
                                }
                              </div>

                              <div className='col-md-9'>
                                <div className='d-flex justify-content-between'>
                                  <h5 className='blue-font mb-0'>BLP</h5>

                                  {!isRemoveFlow && !isRemoveBlp && lockUp.fungibleTokens.length > 1 &&
                                  <img className='cursor-pointer' src="remove-button.png" alt="" width="20px" height="20px"
                                    onClick={() => removeBlp()} />
                                  }                                  
                                </div>

                                <p className='text-grey mb-1 font-14'>{item.identifier}</p>

                                <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                  value={editBlpAmount} onChange={(e) => setEditBlpAmount(e.target.value)} />
                              </div>
                            </div>
                          </div>
                        </div>
                        }
                        </>                        
                        }
                        </React.Fragment>                     
                      ))
                    }
                  </div>

                  {!isRemoveFlow && !isRemoveBlp && lockUp.fungibleTokens.length > 1 &&
                  <div className='d-flex p-2 mt-5'>
                    <img className='mx-2 mt-1' src="remove-button.png" alt="" width="20px" height="20px" />
                    <h5>= Remove from the Coin(s)</h5>
                  </div>
                  }                  

                  <div className='row p-3 pt-0'>
                    <div className='col-md-8'>
                      <h5 className='text-warning'>
                        <FaInfo /> If you don’t enter quantity of Coin(s) to handover, whole ownership of
                        the Coin(s) will goes to recipient.
                      </h5>
                    </div>                 

                    <div className='col-md-4'>
                      {txProgress && txType === "editFT" ?
                        <Button className='blue-bg border-none border-radius-none mt-3' disabled>
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                        :
                        <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => editFT()}>
                          SAVE CHANGES TO COIN(S)
                        </Button>
                      }
                    </div>
                  </div>
                </Tab.Pane>
              }

              {step === "nftcollection" &&
                <Tab.Pane eventKey="first">
                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='blue-font p-2 mb-0'>
                      SELECT NFT COLLECTION(S)
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setStep("detail")} />
                  </div>

                  <div className='row'>
                    {collection && collection.map((item, index) => (
                      <div className='col-md-4 pt-2' key={index}>
                        <Card className='p-3 pb-1 cursor-pointer' onClick={() => selectNFTCollection(item)}>
                          <Card.Img variant="top" src={item.collectionBannerImage} />
                          <Card.Body className='pb-0'>
                            <div className='row'>
                              <div className='col-3 p-0'>
                                <img className='nft-img' src={item.collectionSquareImage} width="100%" height="auto" />
                                <AddNftId lockUp={lockUp} item={item} />
                              </div>

                              <div className='col-9'>
                                <Card.Title>{item.collectionName}</Card.Title>
                                <div className='d-flex'>
                                  <p className='text-grey font-14 mb-0'>
                                    {item.collectionDescription}
                                  </p>
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
              {step === "editnftcollection" &&
                <Tab.Pane eventKey="first">
                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='blue-font p-2 mb-0'>
                      EDIT NFT COLLECTION(S)
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setStep("detail")} />
                  </div>

                  <div className='row'>
                    {ownCollection && ownCollection.map((item, index) => (
                      <div className='col-md-4 pt-2' key={index}>
                        <Card className='p-3 pb-1 cursor-pointer' onClick={() => editNFTCollection(item)}>
                          <Card.Img variant="top" src={item.collectionBannerImage} />
                          <Card.Body className='pb-0'>
                            <div className='row'>
                              <div className='col-3 p-0'>
                                <img className='nft-img' src={item.collectionSquareImage} width="100%" height="auto" />
                                <NftId lockUp={lockUp} item={item} />
                              </div>

                              <div className='col-9'>
                                <Card.Title>{item.collectionName}</Card.Title>
                                <div className='d-flex'>
                                  <p className='text-grey font-14 mb-0'>
                                    {item.collectionDescription}
                                  </p>
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
                      <Form.Check type="checkbox" label="Select All NFTs" 
                        onChange={(e) => selectAllNFT(e)} />
                    </div>
                    <div className='col-md-4 text-end'>
                      <div className='d-flex justify-content-between'>
                        <h4 className='blue-font'>NFT COLLECTION(S)</h4>

                        <FaArrowLeft className='blue-font cursor-pointer mt-1' size={24}
                          onClick={() => setStep("nftcollection")} />
                      </div>
                    </div>
                  </div>

                  <div className='row p-3'>
                    {nft.length > 0 && nft.map((item, index) => (
                      <div className='col-md-4' key={index}>
                        <div className='row grey-border p-2 me-2 mt-2'>
                          <div className='col-3 p-1'>
                            {item.thumbnail.includes("ipfs") ?
                              <img className='green-border' src={"https://ipfs.io/" + item.thumbnail.replace(":/", "")} width="100%" height="auto" />
                              :
                              <img className='green-border' src={item.thumbnail} width="100%" height="auto" />
                            }
                          </div>

                          <div className='col-9'>
                            <div className='d-flex justify-content-between'>
                              <Card.Title>{item.name}</Card.Title>
                              <Form.Check type="checkbox" checked={selectedNFT[index]} onChange={(e) => selectNFT(e, item.id)} />
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

                  {nftIDs.length > 0 ?
                    <>
                      {txProgress && txType === "addNFT" ?
                        <Button className='blue-bg border-none border-radius-none mt-5 me-3' disabled>
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                        :
                        <Button className='blue-bg border-none border-radius-none mt-5 me-3' onClick={() => addNFT()}>
                          ADD NFT(S) TO BACKUP
                        </Button>
                      }
                    </>
                    :
                    <Button className='blue-bg border-none border-radius-none mt-5 me-3' disabled>
                      ADD NFT(S) TO BACKUP
                    </Button>
                  }
                </Tab.Pane>
              }
              {step === "removenfts" &&
                <Tab.Pane eventKey="first">
                  <div className='d-flex justify-content-between pt-2 mx-2 border-bottom-green'>
                    <h4 className='blue-font'>EDIT NFT(S)</h4>
                    <h4 className='blue-font'>NFT COLLECTION(S)</h4>
                    <FaArrowLeft className='blue-font cursor-pointer mt-1' size={24}
                      onClick={() => setStep("editnftcollection")} />
                  </div>

                  <div className='row p-3'>
                    {nft.length > 0 && nft.map((item, index) => showNFT[index] && (
                      <div className='col-md-4' key={index}>
                        <div className='row grey-border p-2 me-2 mt-2'>
                          <div className='col-3 p-1'>
                            {item.thumbnail.includes("ipfs") ?
                              <img className='green-border' src={"https://ipfs.io/" + item.thumbnail.replace(":/", "")} width="100%" height="auto" />
                              :
                              <img className='green-border' src={item.thumbnail} width="100%" height="auto" />
                            }
                          </div>

                          <div className='col-9'>
                            <div className='d-flex justify-content-between'>
                              <Card.Title className="me-2">{item.name}</Card.Title>

                              <img className='cursor-pointer' src="remove-button.png" alt="" width="20px" height="20px"
                                onClick={() => toggleNFTVisibility(index, item.id)} />
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

                  <div className='row p-3 pt-0'>
                    <div className='col-md-6 px-0'>
                      <div className='d-flex mt-3'>
                        <img className='mt-1 me-2' src="remove-button.png" alt="" width="20px" height="20px" />
                        <h5>= Remove from the NFT Collection</h5>
                      </div>
                      <p className='text-warning px-1'>
                        <FaInfo /> = If you remove all the NFTs that would mean you want to 
                        <br/>delegate the ownership of your whole collection
                      </p>
                    </div>

                    <div className='col-md-6'>
                      {txProgress && txType === "editNFT" ?
                        <Button className='blue-bg border-none border-radius-none mt-3' disabled>
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                        :
                        <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => editNFT()}>
                          SAVE CHANGES TO COIN(S)
                        </Button>
                      }
                    </div>
                  </div>                  
                </Tab.Pane>
              }
            </>

            {/* Pledge */}
            <>
              {pledgeStep === "default" &&
                <Tab.Pane eventKey="second">
                  <div className='row'>
                    {pledge && pledge.map((item, index) => (
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
                              {convertDate(Math.floor(item.createdAt * 1000))}
                            </p>

                            {parseInt(Date.now()) >= item.releasedAt ?
                            <>
                              <p className='text-success font-14 mb-0'>
                                Maturity Date
                              </p>
                              <p className='text-success'>
                                {convertDate(Math.floor(item.releasedAt))}
                              </p>
                            </>                              
                            :
                            <>
                              <p className='red-font font-14 mb-0'>
                                Maturity Date
                              </p>
                              <p className='red-font'>
                                {convertDate(Math.floor(item.releasedAt))}
                              </p>
                            </>                              
                            }
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

                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='p-2 blue-font mb-0'>
                      COIN(S)
                      <Button className='mx-3' variant="danger" size="sm" onClick={() => widthdrawCoins()}>
                        WITHDRAW
                      </Button>
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setPledgeStep("default")} />
                  </div>


                  {pledgeItem !== null && pledgeItem.fungibleTokens.length > 0 ?
                    <div className='row mt-2'>
                      {pledgeItem.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                          {item.identifier.includes("FlowToken") &&
                            <div className='col-md-1'>
                              <img src="flowcoin.png" width="100%" height="auto" />
                              <p className='blue-font font-bold text-center'>({parseInt(item.balance)})</p>
                            </div>
                          }

                          {item.identifier.includes("BlpToken") &&
                            <div className='col-md-1'>
                              <img src="coin.png" width="100%" height="auto" />
                              <p className='blue-font font-bold text-center'>({parseInt(item.balance)})</p>
                            </div>
                          }
                        </React.Fragment>
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
                  {pledgeItem && pledgeItem.nonFungibleTokens.length > 0 ?
                    <div className='row'>
                      {pledgeCollection && pledgeCollection.map((item, index) =>
                        <div className='col-md-3 pt-2' key={index}>
                          <Card className='p-3 pb-1 h-100 cursor-pointer' onClick={() => withdrawNFTCollection(item)}>
                            <Card.Img variant="top" src={item.collectionBannerImage} />
                            <Card.Body className='pb-0'>
                              <div className='row'>
                                <div className='col-3 p-0'>
                                  <img className='nft-img' src={item.collectionSquareImage} width="100%" height="auto" />
                                  <NftId lockUp={pledgeItem} item={item} />
                                </div>

                                <div className='col-9'>
                                  <p className='font-bold'>{item.contractName}</p>
                                  <div className='d-flex'>
                                    <p className='text-grey font-14 mb-0'>
                                      {item.collectionDescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      )}
                    </div>
                    :
                    <h5 className='blue-font mx-3 align-self-center'>
                      NO NFT(S)
                    </h5>
                  }
                </Tab.Pane>
              }

              {pledgeStep === "coins" &&
                <Tab.Pane eventKey="second">
                  <div className='d-flex justify-content-between border-bottom-green'>
                    <h4 className='p-2 mb-0 blue-font'>
                      WITHDRAW COIN(S) FROM PLEDGE
                    </h4>

                    <FaArrowLeft className='blue-font cursor-pointer mt-10' size={24}
                      onClick={() => setPledgeStep("item")} />
                  </div>

                  {pledgeItem !== null && pledgeItem.fungibleTokens.length > 0 &&
                    <div className='row p-3'>
                      {pledgeItem.fungibleTokens.map((item, index) => (
                        <>
                          {item.identifier.includes("FlowToken") &&
                            <div className='col-md-4' key={index}>
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
                                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                          value={flowWithdraw} onChange={(e) => setFlowWithdraw(e.target.value)} />
                                      </div>

                                      <div className='col-3'>
                                        {txProgress && txType === "withdrawFlow" ?
                                          <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                          </Spinner>
                                          :
                                          <img className='withdraw-img p-1 cursor-pointer' src="withdraw-icon.png" width="100%" height="auto"
                                            onClick={() => withdrawFlow(item.identifier, pledgeItem.holder)} />
                                        }
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          }

                          {item.identifier.includes("BlpToken") &&
                            <div className='col-md-4' key={index}>
                              <div className='grey-border p-2'>
                                <div className='row'>

                                  <div className='col-md-3'>
                                    <img src="coin.png" width="100%" height="auto" />
                                    <h5 className='text-center'>({parseInt(item.balance)})</h5>
                                  </div>

                                  <div className='col-md-9'>
                                    <h5 className='blue-font mb-0'>BLP</h5>
                                    <p className='text-grey mb-1'>{pledgeItem.holder}</p>

                                    <div className='row'>
                                      <div className='col-9 pr-0'>
                                        <Form.Control className='mb-1' type="text" placeholder='Enter quantity of Coin(s)'
                                          value={blpWithdraw} onChange={(e) => setBlpWithdraw(e.target.value)} />
                                      </div>

                                      <div className='col-3'>
                                        {txProgress && txType === "withdrawBlp" ?
                                          <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                          </Spinner>
                                          :
                                          <img className='withdraw-img p-1 cursor-pointer' src="withdraw-icon.png" width="100%" height="auto"
                                            onClick={() => withdrawBlp(item.identifier, pledgeItem.holder)} />
                                        }
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
                                  Lorem ipsum dolor Lorem <br />
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
                                  Lorem ipsum dolor Lorem <br />
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
                                  Lorem ipsum dolor Lorem <br />
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
                                  Lorem ipsum dolor Lorem <br />
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
                                  Lorem ipsum dolor Lorem <br />
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
                                  Lorem ipsum dolor Lorem <br />
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
                      <div className='d-flex justify-content-between'>
                        <h4 className='blue-font'>NFT COLLECTION(S)</h4>

                        <FaArrowLeft className='blue-font cursor-pointer mt-1' size={24}
                          onClick={() => setPledgeStep("item")} />
                      </div>
                    </div>
                  </div>

                  <div className='row p-3'>
                    {pledgeNFT.length > 0 && pledgeNFT.map((item, index) => (
                      <div className='col-md-4' key={index}>
                        <div className='row grey-border p-2 me-2 mt-2'>
                          <div className='col-3 p-1'>
                            {item.thumbnail.includes("ipfs") ?
                              <img className='green-border' src={"https://ipfs.io/" + item.thumbnail.replace(":/", "")}
                                width="100%" height="auto" />
                              :
                              <img className='green-border' src={item.thumbnail} width="100%" height="auto" />
                            }
                          </div>

                          <div className='col-9'>
                            <div className='d-flex justify-content-between'>
                              <Card.Title>{item.name}</Card.Title>
                              <Form.Check type="checkbox" onChange={(e) => selectWithdrawNFT(e, item.id)} />
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

                  <div className='row p-3 pt-0'>
                    <div className='col-md-6 px-0'>
                      <div className='d-flex mt-4'>
                        <h5>Please select NFTs to withdraw</h5>
                      </div>
                    </div>

                    <div className='col-md-6'>
                      {txProgress && txType === "withdrawNFT" ?
                        <Button className='blue-bg border-none border-radius-none mt-3' disabled>
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                        :
                        <Button className='blue-bg border-none border-radius-none mt-3' onClick={() => withdrawNFT()}>
                          WITHDRAW NFT(S)
                        </Button>
                      }

                    </div>
                  </div>
                </Tab.Pane>
              }
            </>

          </Tab.Content>
        </div>
      </div>

      <ToastContainer hideProgressBar />
    </Tab.Container>
  )
}
