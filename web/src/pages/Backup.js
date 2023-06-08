import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";

import { TokenListProvider, ENV, Strategy } from "flow-native-token-registry";
import { Tab, Nav, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowLeft, FaInfo } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import _ from "lodash";

import { outdatedPathsTestnet } from "../tokens/testnet";

import { createLockUp } from "../cadence/transaction/createLockUp";
import { updateLockUp } from "../cadence/transaction/updateLockUp";
import { destroyLockup } from "../cadence/transaction/destroyLockup";
import { getAccountLockUp } from "../cadence/script/getAccountLockUp";
import { getFungibleTokenInfoMapping } from "../cadence/script/getFungibleTokenInfoMapping";

import { lockFungibleToken } from "../cadence/transaction/lockFungibleToken";
import { lockFungibleTokens } from "../cadence/transaction/lockFungibleTokens";
import { getNonFungibleTokenInfoMapping } from "../cadence/script/getNonFungibleTokenInfoMapping";
import { getCollectionsForAccount } from "../cadence/script/getCollectionsForAccount";
import { getNFTsForAccountCollection } from "../cadence/script/getNFTsForAccountCollection";
import { initCollectionTemplate } from "../cadence/transaction/initCollectionTemplate";
import { setLockUpNFTIDs } from "../cadence/transaction/setLockUpNFTIDs";
import { lockNonFungibleToken } from "../cadence/transaction/lockNonFungibleToken";

import { getLockUpsByRecipient } from "../cadence/script/getLockUpsByRecipient";
import { setupAddVaultAndWithdrawFT } from "../cadence/transaction/setupAddVaultAndWithdrawFT";
import { withdrawNonFungibleToken } from "../cadence/transaction/withdrawNonFungibleToken";

import { isValidFlowAddress } from "../utils/utils";
import { convertDate } from "../utils/utils";
import NftId from "../components/NftId";

/*
 * @dev Getting TokenList for Users functions
 * start
 */
const getStoragePaths = async (address) => {
  let code = await (await fetch("/get_storage_paths.cdc")).text();
  code = code.replace("__OUTDATED_PATHS__", outdatedPathsTestnet.storage);
  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address)],
  });

  return paths;
};

const splitList = (list, chunkSize) => {
  const groups = [];
  let currentGroup = [];
  for (let i = 0; i < list.length; i++) {
    const collectionID = list[i];
    if (currentGroup.length >= chunkSize) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
    currentGroup.push(collectionID);
  }
  groups.push([...currentGroup]);
  return groups;
};

const getStoredItems = async (address, paths) => {
  const code = await (await fetch("/get_stored_items.cdc")).text();
  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [arg(address, t.Address), arg(paths, t.Array(t.String))],
  });

  return items;
};

const bulkGetStoredItems = async (address) => {
  const paths = await getStoragePaths(address);
  const groups = splitList(
    paths.map((p) => p.identifier),
    30
  );
  const promises = groups.map((group) => {
    return getStoredItems(address, group);
  });
  const itemGroups = await Promise.all(promises);
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr);
  }, []);
  return items;
};

/*
 * @dev Getting TokenList for Users functions
 * End
 */

/*
 * @dev Make Balance style to float
 * Start
 */

const isInteger = (balance) => {
  return parseFloat(balance) === Math.floor(balance);
};

const makeBalance = (balance) => {
  if (parseFloat(balance) < 1) {
    return parseFloat(balance);
  }
  if (isInteger(balance)) {
    if (balance.includes(".")) {
      return balance;
    } else {
      return balance + ".0";
    }
  }
  return balance;
};

export default function Backup() {
  const [user, setUser] = useState({ loggedIn: null, addr: "" });
  const [step, setStep] = useState("default");
  const [pledgeStep, setPledgeStep] = useState("default");
  const navigate = useNavigate();
  const [txId, setTxId] = useState("");
  const [txStatus, setTxStatus] = useState(null);
  const [txType, setTxType] = useState(null);
  const [txProgress, setTxProgress] = useState(false);

  const [tokenRegistry, setTokenRegistry] = useState([]);
  const [currentStoredItems, setCurrentStoredItems] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [logoURI, setLogoURI] = useState({});

  const [ftMappingInfo, setFTMappingInfo] = useState({});
  const [nftMappingInfo, setNFTMappingInfo] = useState({});

  //lockups
  const [backupName, setBackupName] = useState("");
  const [recipient, setRecipient] = useState("");
  const today = new Date();
  const [maturity, setMaturity] = useState(today.getTime());
  const [description, setDescription] = useState("");

  const [lockUp, setLockUp] = useState(null);
  const [editLockUp, setEditLockUp] = useState(false);
  const [ft, setFT] = useState(null);
  const [lockupTokenAmount, setLockupTokenAmount] = useState({});
  const [lockupTokensSelect, setLockupTokensSelect] = useState({});
  const [tokenID, setTokenID] = useState({});
  const [tokenHoldAmount, setTokenHoldAmount] = useState({});
  const [lockupTokenList, setLockupTokenList] = useState({});
  const [addSafeTokenList, setAddSafeTokenList] = useState({});
  const [editLockupTokenAmount, setEditLockupTokenAmount] = useState({});
  const [removeLockupTokensList, setRemoveLockupTokensList] = useState({});

  const [collection, setCollection] = useState(null);
  const [contractName, setContractName] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [addNFTCollectionsToSafe, setAddNFTCollectionsToSafe] = useState([]);
  const [publicType, setPublicType] = useState(null);
  const [privateType, setPrivateType] = useState(null);
  const [collectionID, setCollectionID] = useState(null);
  const [nft, setNFT] = useState([]);
  const [nftIDs, setNFTIDs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState([]);
  const [selectAll_checked, setSelectAllChecked] = useState(false);
  const [coinCanBeLockup, setCoinCanBeLockup] = useState(false);
  const [collectionCanbeLockup, setCollectionCanbeLockup] = useState(false);

  const [ownCollection, setOwnCollection] = useState(null);
  const [editNFTIDs, setEditNFTIDs] = useState([]);
  const [showNFT, setShowNFT] = useState(null);
  const [currentNFTIDs, setCurrentNFTIDs] = useState(null);

  //pledges
  const [pledge, setPledge] = useState(null);
  const [pledgeItem, setPledgeItem] = useState(null);
  const [withdrawCoinsAmount, setWithdrawCoinsAmount] = useState({});
  const [holder, setHolder] = useState(null);

  const [pledgeCollection, setPledgeCollection] = useState(null);
  const [pledgeNFT, setPledgeNFT] = useState(null);
  const [withdrawNFTIDs, setWithdrawNFTIDs] = useState([]);
  const [changeSelection, setChangeSelection] = useState([]);
  const [checkWithdrawAllNFT, setCheckWithdrawAllNFT] = useState(false);
  const [coinWithdrawButtonDisable, setCoinWithdarwButtonDisable] =
    useState(false);

  /*
   * @dev Getting TokenList on Flow Test network
   * Start
   */
  const getAllTokenList = () => {
    new TokenListProvider()
      .resolve(Strategy.GitHub, ENV.Testnet)
      .then((tokens) => {
        const tokenList = tokens.getList().map((token) => {
          token.id = `${token.address.replace("0x", "A.")}.${token.contractName
            }`;
          return token;
        });
        setTokenRegistry(tokenList);
        return tokenList;
      })
      .then((tokenList) => {
        getLogoURI(tokenList);
      });
  };
  /*
   * @dev Getting TokenList on Flow Test network
   * End
   */

  const getLogoURI = (tokenList) => {
    let logURI = {};
    for (const item of tokenList) {
      const [, , contractName] = item.id.split(".");
      logURI[contractName] = item.logoURI;
    }

    setLogoURI(logURI);
  };

  /*
   * @dev Getting account's TokenList
   * Start
   */

  const getAccountTokenList = () => {
    if (user.addr) {
      bulkGetStoredItems(user.addr).then((items) => {
        const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path));
        setCurrentStoredItems(orderedItems);
        setBalanceData(orderedItems.filter((item) => item.isVault));
      });
    }
  };
  /*
   * @dev Getting account's TokenList
   * End
   */

  /*
   * @dev Getting account's TokenHoldAmount
   * Start
   */
  const getAccountTokenHoldAmount = () => {
    if (!balanceData) {
      return;
    }

    const data = balanceData.reduce((data, { balance, type: { typeID } }) => {
      const [, , tokenName] = typeID.split(".");
      data[tokenName] = balance;
      return data;
    }, {});
    setTokenHoldAmount(data);
  };

  useEffect(getAccountTokenHoldAmount, [balanceData]);

  /*
   * @dev Getting account's TokenHoldAmount
   * End
   */

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
    setStep("default");
    setPledgeStep("default");
    setNFTIDs([]);
    setWithdrawNFTIDs([]);
    setTxStatus(null);
  }, []);

  useEffect(() => {
    const updatePledgeAsync = async () => {
      if (pledge !== null && pledgeItem !== null) {
        const updatedPledgeItem = pledge.filter(
          (item) => item.holder === pledgeItem.holder
        );
        setPledgeItem(...updatedPledgeItem);
      }
      if (pledge !== null && pledgeCollection !== null && pledgeItem !== null) {
        const updatedPledgeItem = pledge.filter(
          (item) => item.holder === pledgeItem.holder
        );
        const pledgeCollection = await fcl.query({
          cadence: getCollectionsForAccount,
          args: (arg, t) => [arg(holder, t.Address)],
        });

        const nftCollection = [];

        for (const collection of pledgeCollection) {
          for (const data of updatedPledgeItem.nonFungibleTokens) {
            if (collection.nftType.includes(data.identifier)) {
              nftCollection.push(collection);
            }
          }
        }
        setPledgeCollection(nftCollection);
      }
    };
    updatePledgeAsync();
  }, [pledge]);

  useEffect(() => {
    getBackup();
    /* ----------- Getting Account's TokenList --------- */
    getAccountTokenList();

    if (
      txStatus &&
      txStatus.statusString === "SEALED" &&
      txStatus.errorMessage === ""
    ) {
      getBackup();
    }
  }, [user, txStatus]);

  useEffect(() => {
    const data = {};
    if (ft !== null) {
      for (const key in ft) {
        data[getFTContractNameAddress(key).contractName] = key;
        setTokenID(data);
      }
    }
  }, [ft]);

  useEffect(() => {
    const tempOwnCollection = [];
    if (lockUp && lockUp.nonFungibleTokens.length > 0 && collection) {
      for (const item of lockUp.nonFungibleTokens) {
        for (const col of collection) {
          if (col.nftType.includes(item.identifier)) {
            tempOwnCollection.push(col);
          }
        }
      };
      setOwnCollection(tempOwnCollection);
    }

    if (lockUp && lockUp.fungibleTokens.length > 0) {
      const data = {};
      for (const { balance, identifier } of lockUp.fungibleTokens) {
        data[getFTContractNameAddress(identifier).contractName] = balance;
      }
      setLockupTokenList(data);
    }
  }, [lockUp, collection]);

  useEffect(() => {
    if (txId) {
      fcl.tx(txId).subscribe(setTxStatus);
    }
  }, [txId]);

  useEffect(() => {
    const getBackupAsync = async () => {
      if (txStatus && txType === "createLockup") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Lockup is successfully saved!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("default");
        }
      } else if (txStatus && txType === "destoryLockup") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Lockup is successfully destoryed!");
          setTxProgress(false);
          setTxStatus(null);
        }
      } else if (txStatus && txType === "addFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Fungible Token is successfully added!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("detail");
        }
      } else if (txStatus && txType === "addNFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("NonFungible Token is successfully added!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("detail");
        }
      } else if (txStatus && txType === "editFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Fungible Token is successfully edited!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("detail");
        }
      } else if (txStatus && txType === "removeFlow") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Flow token is successfully removed!");
          setTxProgress(false);
          setTxStatus(null);
        }
      } else if (txStatus && txType === "removeBlp") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("Blp token is successfully removed!");
          setTxProgress(false);
          setTxStatus(null);
        }
      } else if (txStatus && txType === "editNFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("NonFungible Token is successfully edited!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("detail");
        }
      } else if (txStatus && txType === "removeNFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          toast.success("NonFungible Token is successfully removed!");
          setTxProgress(false);
          setTxStatus(null);
          setStep("detail");
        }
      } else if (txStatus && txType === "withDrawFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          // window.location.reload(false);
          await getBackup();

          setPledgeStep("item");

          toast.success("Fungible Token is successfully withdrawed!");
          setTxProgress(false);
          setTxStatus(null);
        }
      } else if (txStatus && txType === "withdrawNFT") {
        if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage !== ""
        ) {
          toast.error(txStatus.errorMessage);
          setTxProgress(false);
          setTxStatus(null);
        } else if (
          txStatus.statusString === "SEALED" &&
          txStatus.errorMessage === ""
        ) {
          await getBackup();

          setPledgeStep("item");

          toast.success("NonFungible Token is successfully withdrawed!");
          setTxProgress(false);
          setTxStatus(null);
          setPledgeStep("item");
        }
      }
    };
    getBackupAsync();
  }, [txStatus, txType]);

  useEffect(() => {
    setShowNFT(Array(nft.length).fill(true));
    const ids = [];
    const selected_ids = Array(nft.length).fill(false);
    for (const item of nft) {
      ids.push(item.id);
    }

    setSelectedNFT(selected_ids);
    setCurrentNFTIDs(ids);
  }, [nft]);

  useEffect(() => { }, [step]);

  const logout = () => {
    fcl.unauthenticate();
    navigate("/");
  };

  const getFTContractNameAddress = (identifier) => {
    const [, contractAddress, contractName] = identifier.split(".");
    return { contractAddress, contractName };
  };

  const onHandleChangeLockupTokenAmount = ({ target: { name, value } }) => {
    setLockupTokenAmount((prev) => ({ ...prev, [name]: value }));
  };

  const onHandleChangeEditLockupTokenAmount = (e, key) => {
    setEditLockupTokenAmount((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // -------------------------------- Pledge -> Withdraw functions ----------------
  const onHandleChangeWithdrawCoinsAmount = (e, key) => {
    setWithdrawCoinsAmount((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const getBackup = async () => {
    getAllTokenList();
    if (user.addr) {
      /* ----------- Getting Account's lockup Data --------- */
      const res = await fcl.query({
        cadence: getAccountLockUp,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setLockUp(res);

      const ftinfo = await fcl.query({
        cadence: getFungibleTokenInfoMapping,
      });

      setFT(ftinfo);

      /* ---------- Getting ft maping info ----------- */
      let data = {};
      for (const key in ftinfo) {
        data[getFTContractNameAddress(key).contractName] = ftinfo[key].name;
      }

      setFTMappingInfo(data);

      /* ---------- Getting NFT mapping info ----------- */
      const nftinfo = await fcl.query({
        cadence: getNonFungibleTokenInfoMapping,
      });

      let nft_data = {};
      for (const key in nftinfo) {
        nft_data[getFTContractNameAddress(key).contractName] =
          nftinfo[key].name;
      }

      setNFTMappingInfo(nft_data);

      /* --------- Getting Account's NFT hold list ------------ */
      const collection = await fcl.query({
        cadence: getCollectionsForAccount,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });

      /* --------- Getting NFT collections which are in asset-hand-over registry --------- */
      const nftCollection = [];
      for (const info in nftinfo) {
        for (const item of collection) {
          if (item.nftType.includes(info)) {
            nftCollection.push(item);
          }
        }
      }
      setCollection(nftCollection);

      const pledge = await fcl.query({
        cadence: getLockUpsByRecipient,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      setPledge(pledge);
    }
  };

  const editClick = (e) => {
    e.stopPropagation();
    setStep("create");
    setEditLockUp(true);

    setBackupName(lockUp.name);
    setRecipient(lockUp.recipient);
    setDescription(lockUp.description);
    const dateObject = Math.floor(lockUp.releasedAt * 1000);
    setMaturity(dateObject);
  };

  const createBackup = async () => {
    // in seconds
    const releaseDate = Math.floor(maturity / 1000).toString();
    if (!isValidFlowAddress(recipient)) {
      toast.error("Please input correct flow address!");
      return;
    }

    setTxProgress(true);
    setTxType("createLockup");

    if (editLockUp) {
      try {
        const txid = await fcl.mutate({
          cadence: updateLockUp,
          args: (arg, t) => [
            arg(releaseDate, t.UInt64),
            arg(backupName, t.String),
            arg(description, t.String),
            arg(recipient, t.Address),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    } else {
      try {
        const txid = await fcl.mutate({
          cadence: createLockUp,
          args: (arg, t) => [
            arg(releaseDate, t.UInt64),
            arg(recipient, t.Address),
            arg(backupName, t.String),
            arg(description, t.String),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }
  };

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

      setTxId(txid);
      setStep("default");
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
    }
  };

  const selectFT = (e, key) => {
    setLockupTokensSelect((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  /*
   *@dev add fungible token to lockup
   *Start
   */
  const addFT = async () => {
    for (const key in lockupTokensSelect) {
      if (
        lockupTokenAmount[key] !== "" &&
        lockupTokenAmount[key] !== undefined
      ) {
        if (!/^\d+([\.,]\d+)?$/.test(lockupTokenAmount[key])) {
          toast.error(
            `${key} :Invalid Input Type! You should input only numbers format! `
          );
          return;
        }
      }
      setTxProgress(true);
      setTxType("addFT");
      if (lockupTokensSelect[key]) {
        let data;
        if (lockupTokenAmount[key] !== undefined)
          data = lockupTokenAmount[key].replace(",", ".");
        if (parseFloat(tokenHoldAmount[key]) < parseFloat(data)) {
          toast.error(key + " lockup amount cannot bigger than you hold!");
          setTxProgress(false);
        } else if (
          data === "" ||
          data === undefined ||
          lockupTokenAmount[key] === undefined
        ) {
          toast.success(key + "'s ownership will be locked up!");
          let balance = makeBalance(tokenHoldAmount[key]);
          try {
            const txid = await fcl.mutate({
              cadence: lockFungibleToken,
              args: (arg, t) => [
                arg(tokenID[key], t.String),
                arg(balance, t.UFix64),
              ],
              proposer: fcl.currentUser,
              payer: fcl.currentUser,
              authorizations: [fcl.currentUser],
              limit: 999,
            });
            setTxId(txid);
          } catch (error) {
            setTxProgress(false);
            toast.error(error);
          }
        } else {
          try {
            let balance = makeBalance(data);

            const txid = await fcl.mutate({
              cadence: lockFungibleToken,
              args: (arg, t) => [
                arg(tokenID[key], t.String),
                arg(balance, t.UFix64),
              ],
              proposer: fcl.currentUser,
              payer: fcl.currentUser,
              authorizations: [fcl.currentUser],
              limit: 999,
            });

            setTxId(txid);
          } catch (error) {
            setTxProgress(false);
            toast.error(error);
          }
        }
      }
    }
  };
  /*
   *@dev add fungible token to lockup
   *End
   */

  const getAllNFTCollectionInfo = () => {
    /* filter NFT collections from assets-hands-over */
    const nftIdentifiers = lockUp.nonFungibleTokens.map(
      ({ identifier }) => `${identifier}.NFT`
    );
    const data = collection.filter(
      ({ nftType }) => !nftIdentifiers.includes(nftType)
    );

    setAddNFTCollectionsToSafe(data);

    setCollectionCanbeLockup(data.length > 0);
    setStep("nftcollection");
  };

  const selectNFTCollection = async (item) => {
    const nftRes = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(user.addr, t.Address),
        arg(item.collectionIdentifier, t.String),
      ],
    });

    setNFT(nftRes);
    setContractName(item.contractName);
    setContractAddress(item.contractAddress);
    setPublicType(item.publicLinkedType.typeID);
    setPrivateType(item.privateLinkedType.typeID);
    setCollectionID(item.nftType);

    setSelectAllChecked(false);
    setStep("nfts");
  };

  const selectNFT = (e, id) => {
    let ids = [...nftIDs];
    let selected_ids = [...selectedNFT];
    let nftallids = [];

    for (const item of nft) {
      nftallids.push(item.id);
    }

    if (e.target.checked) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
      if (nftallids.length === ids.length) {
        setSelectAllChecked(true);
      }
    } else {
      setSelectAllChecked(false);
      if (ids.includes(id)) {
        ids = ids.filter((item) => item !== id);
      }
    }

    selected_ids[nftallids.indexOf(id)] = !selected_ids[nftallids.indexOf(id)];
    setSelectedNFT(selected_ids);
    setNFTIDs(ids);
  };

  const selectAllNFT = (e) => {
    let ids = [];
    let selected_ids = [...selectedNFT];

    if (e.target.checked) {
      setSelectAllChecked(true);
      nft.map((item, index) => {
        ids.push(item.id);
        selected_ids[index] = true;
      });
    } else {
      setSelectAllChecked(false);
      ids = [];
      nft.map((item, index) => {
        selected_ids[index] = false;
      });
    }

    setSelectedNFT(selected_ids);
    setNFTIDs(ids);
  };

  const addNFT = async () => {
    const publicVal = publicType.replace(/A\.[^\.]*\./g, "");
    const privateVal = privateType.replace(/A\.[^\.]*\./g, "");
    setTxProgress(true);
    setTxType("addNFT");

    try {
      const txid = await fcl.mutate({
        cadence: initCollectionTemplate(
          contractName,
          contractAddress,
          publicVal,
          privateVal
        ),
        args: (arg, t) => [
          arg(collectionID.replace(".NFT", ""), t.String),
          arg(nftIDs, t.Array(t.UInt64)),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      setTxId(txid);
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
    }
  };

  const editFT = async () => {
    let isDataEdited = false;
    const remainItem = lockUp.fungibleTokens;
    for (const key in editLockupTokenAmount) {
      let data = editLockupTokenAmount[key];
      if (data !== "") {
        if (!/^\d+([\.,]\d+)?$/.test(data)) {
          toast.error(
            `${key} :Invalid Input Type! You should input only numbers format! `
          );
          return;
        }
        data = data.replace(",", ".");
      }
      if (parseFloat(data) > parseFloat(tokenHoldAmount[key])) {
        toast.error("You cannot lockup bigger than you hold!");
        return;
      } else if (parseFloat(data) !== parseFloat(lockupTokenList[key])) {
        isDataEdited = true;
      }
    }
    if (remainItem.length > 0 && _.isEmpty(editLockupTokenAmount)) {
      isDataEdited = true;
      toast.success("You will lokcup all coins in your account!");
    }
    if (Object.keys(removeLockupTokensList).length > 0) isDataEdited = true;

    if (isDataEdited === false) {
      toast.error("No data changed!");
      return;
    }

    if (remainItem.length > 0) {
      setTxProgress(true);
      setTxType("editFT");
      for (const item of remainItem) {
        const key = getFTContractNameAddress(item.identifier).contractName;
        let balance;
        if (key in editLockupTokenAmount) {
          balance = editLockupTokenAmount[key].replace(",", ".");
        }
        if (balance === "" || balance === undefined) {
          balance = tokenHoldAmount[key];
        }
        balance = makeBalance(balance);
        try {
          const txid = await fcl.mutate({
            cadence: lockFungibleTokens,
            args: (arg, t) => [
              arg(
                [{ key: tokenID[key], value: balance }],
                t.Dictionary({ key: t.String, value: t.Optional(t.UFix64) })
              ),
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
            limit: 999,
          });

          setTxId(txid);
        } catch (error) {
          toast.error(error);
          setTxProgress(false);
        }
      }
    }
  };

  const editNFTCollection = async (item) => {
    const nft = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(user.addr, t.Address),
        arg(item.collectionIdentifier, t.String),
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
    setCollectionID(item.nftType);

    setStep("removenfts");
  };

  const toggleNFTVisibility = (index, id) => {
    const newShowNFT = [...showNFT];
    newShowNFT[index] = !newShowNFT[index];
    setShowNFT(newShowNFT);

    let data = currentNFTIDs;
    data.forEach((item, index) => {
      if (item === id) data.splice(index, 1);
    });

    setEditNFTIDs(data);
  };

  const editNFT = async () => {
    setTxProgress(true);
    setTxType("editNFT");
    if (currentNFTIDs.length > 0) {
      try {
        const txid = await fcl.mutate({
          cadence: setLockUpNFTIDs,
          args: (arg, t) => [
            arg(collectionID.replace(".NFT", ""), t.String),
            arg(editNFTIDs, t.Array(t.UInt64)),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    } else {
      toast.warning("Your collection ownership will be lock up!");
      try {
        const txid = await fcl.mutate({
          cadence: lockNonFungibleToken,
          args: (arg, t) => [
            arg(collectionID.replace(".NFT", ""), t.String),
            arg(null, t.Optional(t.Array(t.UInt64))),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          authorizations: [fcl.currentUser],
          limit: 999,
        });

        setTxId(txid);
      } catch (error) {
        setTxProgress(false);
        toast.error(error);
      }
    }
  };

  const onHandleClickEditCoins = (e) => {
    setStep("removecoins");
  };
  const onHandleClickRemoveLockupToken = (e, key) => {
    const data = removeLockupTokensList;

    data[getFTContractNameAddress(key).contractName] =
      lockupTokenList[getFTContractNameAddress(key).contractName];
    setRemoveLockupTokensList(data);
    if (lockUp.fungibleTokens.length <= 1) {
      toast.error("Cannot Delete! You should have at least 1 coin in lockup! ");
      return;
    }
    setLockUp((prev) => ({
      ...prev,
      fungibleTokens: prev.fungibleTokens.filter(
        ({ identifier }) => identifier !== key
      ),
    }));
  };

  const onClickHandleAddCoinsToSafe = (e) => {
    getBackup();

    /* ------------- delete louptoken list from Account's token hold list ----------- */
    const data = _.omit(tokenHoldAmount, Object.keys(lockupTokenList));

    /* ------------- Filter available token list from asset-hand-over-registry ----------- */
    const filter_ft_data = _.pick(data, Object.keys(ftMappingInfo));

    setAddSafeTokenList(filter_ft_data);
    let isCoinCanBeLockup = false;
    if (!_.isEmpty(filter_ft_data)) {
      for (const key in filter_ft_data) {
        if (parseFloat(filter_ft_data[key]) > 0) {
          isCoinCanBeLockup = true;
        }
      }
    }
    setWithdrawNFTIDs([]);
    setCoinCanBeLockup(isCoinCanBeLockup);
    setLockupTokensSelect({});
    setStep("coins");
  };

  //Pledges
  const clickPledge = async (item) => {
    setPledgeItem(item);
    const length = item.fungibleTokens.length;
    let count = 0;
    for (const data of item.fungibleTokens) {
      if (parseFloat(data.balance) === 0) {
        count++;
      }
    }
    setCoinWithdarwButtonDisable(false);
    if (count === length) {
      setCoinWithdarwButtonDisable(true);
    }
    setHolder(item.holder);
    const pledgeCollection = await fcl.query({
      cadence: getCollectionsForAccount,
      args: (arg, t) => [arg(item.holder, t.Address)],
    });

    /* ---------------- Getting NFT Collection info Asset-hand-over registry -------------- */
    const nftCollection = [];

    for (const collection of pledgeCollection) {
      for (const data of item.nonFungibleTokens) {
        if (collection.nftType.includes(data.identifier)) {
          nftCollection.push(collection);
        }
      }
    }

    setPledgeCollection(nftCollection);
    setPledgeStep("item");
  };

  const pledgeItemNFTCount = (param1, item) => {
    let length = 0;
    param1.nonFungibleTokens.forEach((nft) => {
      if (item.nftType.replace(".NFT", "") === nft.identifier) {
        length = nft.nftIDs.length;
      }
    });
    return length;
  };

  const withdrawCoins = () => {
    const currentDate = Math.floor(Date.now() / 1000);

    if (currentDate <= pledgeItem.releasedAt) {
      toast.error("The assets are still in lock-up period");
    } else {
      setPledgeStep("coins");
    }
  };

  const withDrawFT = async (holder, item) => {
    const [, contractAddress, contractName] = item.identifier.split(".");

    let data = withdrawCoinsAmount[contractName];
    let withdrawAmount;
    if (data === "" || data === undefined) {
      withdrawAmount = item.balance;
      data = item.balance;
      toast.warning("You will withdraw max amount in safe!");
    } else {
      if (!/^\d+([\.,]\d+)?$/.test(data)) {
        toast.error(
          "Invalid Input Type! You should input only numbers format! "
        );
        return;
      }
      withdrawAmount = makeBalance(data.replace(",", "."));
    }

    if (parseFloat(withdrawAmount) > parseFloat(item.balance)) {
      toast.error("You cannot withdraw more than exists in safe!");
      return;
    }
    setTxProgress(true);
    setTxType("withDrawFT");
    try {
      const txid = await fcl.mutate({
        cadence: setupAddVaultAndWithdrawFT(contractName, contractAddress),
        args: (arg, t) => [
          arg(item.identifier, t.String),
          arg(holder, t.Address),
          arg(withdrawAmount, t.UFix64),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      setTxId(txid);
    } catch (error) {
      toast.error(error);
      setTxProgress(false);
    }
  };

  const selectAllWithdrawNFT = async (e) => {
    let selectIDs = [];
    if (e.target.checked) {
      setCheckWithdrawAllNFT(true);
      let temp = Array(changeSelection.length).fill(true);
      for (const item of pledgeNFT) {
        selectIDs.push(item.id);
      }

      setChangeSelection(temp);
    } else {
      setCheckWithdrawAllNFT(false);

      let temp = Array(changeSelection.length).fill(false);
      setChangeSelection(temp);
    }
    setWithdrawNFTIDs(selectIDs);
  };

  const withdrawNFTCollection = async (item) => {
    const currentDate = Math.floor(Date.now() / 1000);

    if (currentDate <= pledgeItem.releasedAt) {
      toast.error("The assets are still in lock-up period");
      return;
    }
    const nft = await fcl.query({
      cadence: getNFTsForAccountCollection,
      args: (arg, t) => [
        arg(holder, t.Address),
        arg(item.collectionIdentifier, t.String),
      ],
    });

    var ownNFTIDs = [];
    for (const token of pledgeItem) {
      if (item.nftType.includes(token.identifier)) ownNFTIDs = token.nftIDs;
    }

    var ownNFT = [];
    nft.map((nftItem) => {
      if (ownNFTIDs.includes(nftItem.id)) ownNFT.push(nftItem);
    });

    setPledgeNFT(ownNFT);
    let selectionFlag_NFTWithdraw = Array(ownNFT.length).fill(false);
    setChangeSelection(selectionFlag_NFTWithdraw);
    setCollectionID(item.nftType);

    setPledgeStep("nfts");
  };

  const selectWithdrawNFT = (e, id, index) => {
    let ids = [...withdrawNFTIDs];
    let changeSelectionFlag = [...changeSelection];
    if (e.target.checked) {
      changeSelectionFlag[index] = true;
      if (!ids.includes(id)) {
        ids.push(id);
      }
    } else {
      setCheckWithdrawAllNFT(false);
      changeSelectionFlag[index] = false;
      if (ids.includes(id)) {
        ids = ids.filter((item) => item !== id);
      }
    }
    setChangeSelection(changeSelectionFlag);
    setWithdrawNFTIDs(ids);
  };

  const withdrawNFT = async () => {
    setTxProgress(true);
    setTxType("withdrawNFT");
    let withdrawNFTids = [];
    pledgeNFT.map((item, index) => {
      if (changeSelection[index]) {
        withdrawNFTids.push(item.id);
      }
    });

    setWithdrawNFTIDs(withdrawNFTids);
    try {
      const txid = await fcl.mutate({
        cadence: withdrawNonFungibleToken,
        args: (arg, t) => [
          arg(collectionID.replace(".NFT", ""), t.String),
          arg(holder, t.Address),
          arg(withdrawNFTids, t.Array(t.UInt64)),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999,
      });

      setTxId(txid);
    } catch (error) {
      setTxProgress(false);
      toast.error(error);
    }
  };

  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
      <div className="row mt-5 mb-5">
        <div className="col-xl-2 col-lg-3">
          <Nav variant="pills" className="search-pad">
            <Nav.Item className="type">
              <Nav.Link
                eventKey="first"
                className="text-center"
                onClick={() => setStep("default")}
              >
                <img src="safe.png" width="80%" height="80%" alt="Safe" />
                <h5 className="mt-3 blue-font">SAFE</h5>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item className="type">
              <Nav.Link
                eventKey="second"
                className="text-center"
                onClick={() => setPledgeStep("default")}
              >
                <img src="pleages.png" width="80%" height="80%" alt="Pledge" />
                <h5 className="mt-3 blue-font">PLEDGES</h5>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item className="type" onClick={() => logout()}>
              <Nav.Link eventKey="third" className="text-center">
                <p className="text-grey mb-0 font-12">{user.addr}</p>
                <img
                  className="mt-1"
                  src="wallet1.png"
                  width="50%"
                  height="50%"
                  alt="Wallet"
                />
                <h5 className="mt-3 blue-font">
                  DISCONNECT <br /> WALLET
                </h5>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <div className="col-xl-10 col-lg-9 d-flex pb-2">
          <Tab.Content className="w-100">
            <>
              {step === "default" && (
                <Tab.Pane eventKey="first">
                  {lockUp ? (
                    <div className="center-pad">
                      <div className="row justify-content-center">
                        <div className="col-xl-3 col-lg-5">
                          <Card
                            className="text-center cursor-pointer"
                            onClick={() => {
                              getBackup();
                              setStep("detail");
                            }}
                          >
                            <Card.Img
                              className="item-img"
                              variant="top"
                              src="safe.png"
                            />
                            <Card.Body>
                              <Card.Title className="blue-font">
                                {lockUp.name}
                              </Card.Title>
                              <p className="text-grey mb-1">
                                {lockUp.recipient}
                              </p>
                              <p className="text-warning mb-1">
                                {lockUp.description}
                              </p>
                              <p className="font-14 mb-0 blue-font">
                                Created at
                              </p>
                              <p className="mb-1 blue-font">
                                {convertDate(
                                  Math.floor(lockUp.createdAt * 1000)
                                )}
                              </p>

                              {Math.floor(Date.now() / 1000) >=
                                lockUp.releasedAt ? (
                                <>
                                  <p className="text-success font-14 mb-0">
                                    Maturity Date
                                  </p>
                                  <p className="text-success">
                                    {convertDate(
                                      Math.floor(lockUp.releasedAt * 1000)
                                    )}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="red-font font-14 mb-0">
                                    Maturity Date
                                  </p>
                                  <p className="red-font">
                                    {convertDate(
                                      Math.floor(lockUp.releasedAt * 1000)
                                    )}
                                  </p>
                                </>
                              )}

                              <Button
                                variant="dark"
                                size="sm"
                                className="blue-bg me-1"
                                onClick={(e) => editClick(e)}
                              >
                                Edit
                              </Button>

                              {txProgress && txType === "destoryLockup" ? (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="red-bg"
                                  disabled
                                >
                                  <Spinner
                                    animation="border"
                                    role="status"
                                    size="sm"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </Spinner>
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="red-bg"
                                  onClick={(e) => destoryBackup(e)}
                                >
                                  Remove
                                </Button>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="center-pad">
                      <div className="row justify-content-center">
                        <div
                          className="col-xl-3 col-lg-5 text-center cursor-pointer"
                          onClick={() => setStep("create")}
                        >
                          <FaPlus className="blue-font mt-5 me-2" size={60} />
                          <h5 className="mt-3 blue-font">CREATE NEW SAFE</h5>
                        </div>
                      </div>
                    </div>
                  )}
                </Tab.Pane>
              )}

              {step === "create" && (
                <Tab.Pane eventKey="first">
                  <div className="row p-3">
                    <div className="col-md-6">
                      <h4 className="blue-font mb-4">CREATE NEW SAFE</h4>
                      <h5 className="mb-5">
                        Create a new safe to protect your assets. A safe is a
                        secure container where you can store your digital assets
                        and control their access. When you create a new safe,
                        you gain the ability to manage and authorize
                        transactions involving your assets. Safes provide an
                        added layer of security and control, ensuring that only
                        authorized individuals can interact with your valuable
                        tokens. Take control of your assets and create a new
                        safe today.
                      </h5>
                      <div className="d-flex justify-content-center">
                        <img
                          src="page-3-banner.png"
                          width="80%"
                          height="auto"
                          alt="page banner"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Safe Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={backupName}
                            onChange={(e) => setBackupName(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            Recipient's Wallet ID{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            Maturity Date <span className="text-danger">*</span>
                          </Form.Label>
                          <DatePicker
                            className="form-control"
                            selected={new Date(maturity)}
                            minDate={new Date()}
                            excludeDates={[new Date()]}
                            dateFormat="MM-DD-YYYY" // set the date format
                            onChange={(date) => {
                              setMaturity(date.getTime());
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </Form.Group>

                        {txProgress && txType === "createLockup" ? (
                          <Button
                            className="blue-bg border-radius-none mt-5"
                            disabled
                          >
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </Spinner>
                          </Button>
                        ) : (
                          <>
                            {editLockUp ? (
                              <Button
                                className="blue-bg border-radius-none mt-5"
                                onClick={createBackup}
                              >
                                SAVE CHANGES
                              </Button>
                            ) : (
                              <Button
                                className="blue-bg border-radius-none mt-5"
                                onClick={createBackup}
                              >
                                CREATE SAFE
                              </Button>
                            )}
                          </>
                        )}
                      </Form>
                    </div>
                  </div>
                </Tab.Pane>
              )}

              {step === "detail" && (
                <Tab.Pane eventKey="first">
                  <div className="row p-3 mb-3">
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-3 d-flex green-border main-avatar">
                          <img
                            src="safe.png"
                            width="100%"
                            height="auto"
                            alt="safe"
                          />
                        </div>

                        <div className="col-md-9 text-md-start text-center">
                          <h5 className="blue-font">{lockUp.name}</h5>
                          <p className="blue-font mb-0">{lockUp.description}</p>
                          <p className="text-grey">{lockUp.recipient}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 text-webkit-right">
                      <p className="font-bold backup-date blue-font">
                        CREATED AT:{" "}
                        {convertDate(Math.floor(lockUp.createdAt * 1000))}
                      </p>

                      <p className="font-bold maturity-date blue-bg border-none">
                        MATURITY DATE:{" "}
                        {convertDate(Math.floor(lockUp.releasedAt * 1000))}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-bottom-green">
                    <div className="d-flex justify-content-start gap-2">
                      <h4 className="blue-font mb-0">COIN(S)</h4>
                      {lockUp !== null && lockUp.fungibleTokens.length > 0 ? (
                        <div className="d-flex align-items-center">
                          <h6 className="text-center m-0">
                            (<span className="text-success">Withdrawable</span>{" "}
                            /{" "}
                            <span className="text-warning">
                              Account's Balance
                            </span>
                            )
                          </h6>
                          <Button
                            className="mx-3"
                            variant="danger"
                            size="sm"
                            onClick={onHandleClickEditCoins}
                          >
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setStep("default")}
                    />
                  </div>

                  {lockUp !== null && lockUp.fungibleTokens.length > 0 ? (
                    <div className="d-flex mt-2">
                      {lockUp.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className="text-center">
                            <img
                              src={
                                logoURI[
                                getFTContractNameAddress(item.identifier)
                                  .contractName
                                ]
                              }
                              width="60px"
                              height="auto"
                              alt="logo"
                            />

                            {item.balance === null ? (
                              <h6 className="text-center">(All)</h6>
                            ) : (
                              <h6 className="text-center">
                                (
                                <span className="text-success">
                                  {parseInt(item.balance)}
                                </span>
                                /
                                <span className="text-warning">
                                  {parseFloat(
                                    tokenHoldAmount[
                                    getFTContractNameAddress(item.identifier)
                                      .contractName
                                    ]
                                  ).toFixed(2)}
                                </span>
                                )
                              </h6>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                      <div className="text-center ps-4">
                        <div
                          className="backup-date p-3 cursor-pointer m-auto"
                          onClick={onClickHandleAddCoinsToSafe}
                        >
                          <FaPlus className="blue-font" size={40} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex mt-4">
                      <div
                        className="backup-date p-3 cursor-pointer"
                        onClick={onClickHandleAddCoinsToSafe}
                      >
                        <FaPlus className="blue-font" size={40} />
                      </div>
                      <h5 className="blue-font mx-3 align-self-center">
                        ADD COIN(S) TO SAFE
                      </h5>
                    </div>
                  )}

                  <div className="d-flex align-items-center border-bottom-green gap-3">
                    <h4>NFT COLLECTION(S)</h4>
                    {lockUp !== null && lockUp.nonFungibleTokens.length > 0 ? (
                      <div className="d-flex gap-3 align-items-center">
                        <h6 className="text-center m-0">
                          (<span className="text-success">Withdrawable</span> /{" "}
                          <span className="text-warning">Account's NFTs</span>)
                        </h6>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setStep("editnftcollection")}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  {lockUp !== null && lockUp.nonFungibleTokens.length > 0 ? (
                    <div className="row">
                      {ownCollection &&
                        ownCollection.map((item, index) => (
                          <div className="col-md-3 pt-2" key={index}>
                            <Card className="p-3 pb-1 h-100">
                              <Card.Img
                                variant="top"
                                src={item.collectionBannerImage}
                              />
                              <Card.Body className="pb-0">
                                <div className="row">
                                  <div className="col-3 p-0">
                                    <img
                                      className="nft-img"
                                      src={item.collectionSquareImage}
                                      width="100%"
                                      height="auto"
                                      alt="collection"
                                    />
                                    <div className="d-inline">
                                      <h6 className="d-inline text-center">
                                        (
                                        <span className="text-success">
                                          <NftId lockUp={lockUp} item={item} />
                                        </span>
                                        /
                                        <span className="text-warning">
                                          {item.nftsCount}
                                        </span>
                                        )
                                      </h6>
                                    </div>
                                  </div>

                                  <div className="col-9">
                                    <p className="font-bold">
                                      {item.contractName}
                                    </p>
                                    <div className="d-flex">
                                      <p className="text-grey font-14 mb-0 d-none d-xl-block">
                                        {item.collectionDescription}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-grey font-14 mb-0 d-block d-xl-none">
                                    {item.collectionDescription}
                                  </p>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}

                      <div className="w-auto pt-2">
                        <div className="center-pad">
                          <div
                            className="backup-date p-3 cursor-pointer m-auto"
                            onClick={getAllNFTCollectionInfo}
                          >
                            <FaPlus className="blue-font" size={40} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex mt-4">
                      <div
                        className="backup-date p-3 cursor-pointer"
                        onClick={getAllNFTCollectionInfo}
                      >
                        <FaPlus className="blue-font" size={40} />
                      </div>
                      <h5 className="blue-font mx-3 align-self-center">
                        ADD NFT(S) TO SAFE
                      </h5>
                    </div>
                  )}
                </Tab.Pane>
              )}

              {step === "coins" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between border-bottom-green">
                    <h4 className="blue-font p-2 mb-0">SELECT COIN(S)</h4>

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setStep("detail")}
                    />
                  </div>

                  <div className="row p-3">
                    {coinCanBeLockup &&
                      Object.keys(addSafeTokenList).map(
                        (key, index) =>
                          addSafeTokenList[key] > 0 && (
                            <div className="col-lg-6 col-xl-4 pt-2" key={index}>
                              <div className="grey-border p-2">
                                <div className="row">
                                  <div className="col-md-3">
                                    <>
                                      <img
                                        src={logoURI[key]}
                                        key={index}
                                        width="100%"
                                        height="auto"
                                        alt="TokenLogo"
                                      />
                                      <h5 className="text-center">
                                        {parseInt(tokenHoldAmount[key])}
                                      </h5>
                                    </>
                                  </div>

                                  <div className="col-md-9">
                                    <div className="d-flex justify-content-between">
                                      <h5 className="blue-font mb-0">{key}</h5>
                                      <Form.Check
                                        className="mx-2"
                                        checked={
                                          lockupTokensSelect[key] || false
                                        }
                                        type="checkbox"
                                        onChange={(e) => selectFT(e, key)}
                                      />
                                    </div>

                                    <p className="text-grey mb-1 font-14">
                                      {
                                        getFTContractNameAddress(key)
                                          .contractAddress
                                      }
                                    </p>
                                    <Form.Control
                                      className="mb-1"
                                      type="text"
                                      placeholder="Enter quantity of Coin(s)"
                                      name={key}
                                      disabled={!lockupTokensSelect[key]}
                                      onChange={onHandleChangeLockupTokenAmount}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                  </div>

                  <div className="row mt-3 p-3">
                    <div className="col-md-8">
                      {coinCanBeLockup ? (
                        <h5 className="text-warning">
                          <FaInfo /> Not specifying an amount it implies max
                          balance.
                        </h5>
                      ) : (
                        <h5 className="text-warning">
                          <FaInfo /> You have no tokens to add to the safe!
                        </h5>
                      )}
                    </div>

                    <div className="col-md-4">
                      <>
                        {txProgress && txType === "addFT" ? (
                          <Button
                            className="blue-bg border-none border-radius-none mt-3"
                            disabled
                          >
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </Spinner>
                          </Button>
                        ) : (
                          <Button
                            className="blue-bg border-none border-radius-none mt-3"
                            onClick={() => addFT()}
                            disabled={Object.values(lockupTokensSelect).every(
                              (value) => !value
                            )}
                          >
                            ADD COINS TO SAFE
                          </Button>
                        )}
                      </>
                    </div>
                  </div>
                </Tab.Pane>
              )}
              {step === "removecoins" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between align-items-center border-bottom-green">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                      <h4 className="blue-font p-2 mb-0">EDIT COIN(S)</h4>
                      <h6 className="text-center m-0">
                        (<span className="text-success">Withdrawable</span> /{" "}
                        <span className="text-warning">Account's Balance</span>)
                      </h6>
                    </div>
                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setStep("detail")}
                    />
                  </div>

                  <div className="row p-3">
                    {lockUp !== null &&
                      lockUp.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                          <>
                            <div className="col-lg-6 col-xl-4 pt-2">
                              <div className="row grey-border p-2 align-items-center">
                                <div className="col-md-4">
                                  <img
                                    src={
                                      logoURI[
                                      getFTContractNameAddress(
                                        item.identifier
                                      ).contractName
                                      ]
                                    }
                                    width="100%"
                                    height="auto"
                                    alt="logo"
                                  />
                                  <h6 className="text-center">
                                    (
                                    <span className="text-success">
                                      {parseInt(item.balance)}
                                    </span>
                                    /
                                    <span className="text-warning">
                                      {parseFloat(
                                        tokenHoldAmount[
                                        getFTContractNameAddress(
                                          item.identifier
                                        ).contractName
                                        ]
                                      ).toFixed(2)}
                                    </span>
                                    )
                                  </h6>
                                </div>

                                <div className="col-md-8">
                                  <div className="d-flex justify-content-between">
                                    <h5 className="blue-font mb-0">
                                      {
                                        getFTContractNameAddress(
                                          item.identifier
                                        ).contractName
                                      }
                                    </h5>
                                    <img
                                      className="cursor-pointer"
                                      onClick={(e) =>
                                        onHandleClickRemoveLockupToken(
                                          e,
                                          item.identifier
                                        )
                                      }
                                      src="remove-button.png"
                                      alt=""
                                      width="20px"
                                      height="20px"
                                    />
                                  </div>

                                  <p className="text-grey mb-1 font-14">
                                    {
                                      getFTContractNameAddress(item.identifier)
                                        .contractAddress
                                    }
                                  </p>

                                  <Form.Control
                                    className="mb-1"
                                    type="text"
                                    placeholder="Enter quantity of Coin(s)"
                                    value={
                                      editLockupTokenAmount[
                                      getFTContractNameAddress(
                                        item.identifier
                                      ).contractName || ""
                                      ]
                                    }
                                    onChange={(e) =>
                                      onHandleChangeEditLockupTokenAmount(
                                        e,
                                        getFTContractNameAddress(
                                          item.identifier
                                        ).contractName
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* {!isRemoveFlow && !isRemoveBlp && lockUp.fungibleTokens.length > 1 &&
                    <div className='d-flex p-2 mt-5'>
                      <img className='mx-2 mt-1' src="remove-button.png" alt="" width="20px" height="20px" />
                      <h5>= Remove Coin(s) from Safe</h5>
                    </div>
                  } */}

                  <div className="row p-3 pt-0">
                    <div className="col-md-8">
                      <h5 className="text-warning">
                        <FaInfo /> By not specifying an amount you can add
                        account's current balance to the safe.
                      </h5>
                    </div>

                    <div className="col-md-4">
                      {txProgress && txType === "editFT" ? (
                        <Button
                          className="blue-bg border-none border-radius-none mt-3"
                          disabled
                        >
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                      ) : (
                        <Button
                          className="blue-bg border-none border-radius-none mt-3"
                          onClick={() => editFT()}
                        >
                          SAVE CHANGES TO COIN(S)
                        </Button>
                      )}
                    </div>
                  </div>
                </Tab.Pane>
              )}

              {step === "nftcollection" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between border-bottom-green">
                    <h4 className="blue-font p-2 mb-0">
                      SELECT NFT COLLECTION(S)
                    </h4>

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setStep("detail")}
                    />
                  </div>

                  <div className="row">
                    {addNFTCollectionsToSafe.length > 0 &&
                      addNFTCollectionsToSafe.map((item, index) => (
                        <div className="col-md-4 pt-2" key={index}>
                          <Card
                            className="p-3 pb-1 h-100 cursor-pointer"
                            onClick={() => selectNFTCollection(item)}
                          >
                            <Card.Img
                              variant="top"
                              src={item.collectionBannerImage}
                            />
                            <Card.Body className="pb-0">
                              <div className="row">
                                <div className="col-3 p-0">
                                  <img
                                    className="nft-img"
                                    src={item.collectionSquareImage}
                                    width="100%"
                                    height="auto"
                                    alt="collection"
                                  />
                                  <h5 className="justify-content-center text-center">
                                    ({item.nftsCount})
                                  </h5>
                                </div>

                                <div className="col-9">
                                  <Card.Title>{item.collectionName}</Card.Title>
                                  <div className="d-flex">
                                    <p className="text-grey font-14 mb-0">
                                      {item.collectionDescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    {!collectionCanbeLockup && (
                      <>
                        <h5 className="text-warning">
                          <FaInfo /> You have no NFT collections to add to the
                          safe!
                        </h5>
                      </>
                    )}
                  </div>
                </Tab.Pane>
              )}
              {step === "editnftcollection" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between align-items-center border-bottom-green">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                      <h4 className="blue-font p-2 mb-0">
                        EDIT NFT COLLECTION(S)
                      </h4>
                      <h6 className="text-center m-0">
                        (<span className="text-success">Withdrawable</span> /{" "}
                        <span className="text-warning">Account's NFTs</span>)
                      </h6>
                    </div>
                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setStep("detail")}
                    />
                  </div>

                  <div className="row">
                    {ownCollection &&
                      ownCollection.map((item, index) => (
                        <div className="col-md-4 pt-2 d-flex" key={index}>
                          <Card
                            className="p-3 pb-1 cursor-pointer"
                            onClick={() => editNFTCollection(item)}
                          >
                            <Card.Img
                              variant="top"
                              src={item.collectionBannerImage}
                            />
                            <Card.Body className="pb-0">
                              <div className="row">
                                <div className="col-3 p-0">
                                  <img
                                    className="nft-img"
                                    src={item.collectionSquareImage}
                                    width="100%"
                                    height="auto"
                                    alt="collection"
                                  />
                                  <div className="d-inline">
                                    <h6 className="d-inline text-center">
                                      (
                                      <span className="text-success">
                                        <NftId lockUp={lockUp} item={item} />
                                      </span>
                                      /
                                      <span className="text-warning">
                                        {item.nftsCount}
                                      </span>
                                      )
                                    </h6>
                                  </div>
                                </div>

                                <div className="col-9">
                                  <Card.Title>{item.collectionName}</Card.Title>
                                  <div className="d-flex">
                                    <p className="text-grey font-14 mb-0">
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

                  <div className="row"></div>
                </Tab.Pane>
              )}

              {step === "nfts" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between pt-2 mx-2 border-bottom-green">
                    <h4 className="blue-font">SELECT NFT(S)</h4>
                    <Form.Check
                      type="checkbox"
                      label="Select All NFTs"
                      checked={selectAll_checked}
                      onChange={(e) => selectAllNFT(e)}
                    />
                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-1"
                      size={24}
                      onClick={() => setStep("nftcollection")}
                    />
                  </div>

                  <div className="row p-3">
                    {nft.length > 0 &&
                      nft.map((item, index) => (
                        <div className="col-md-4" key={index}>
                          <div className="row grey-border p-2 me-2 mt-2">
                            <div className="col-3 p-1">
                              {item.thumbnail.includes("ipfs") ? (
                                <img
                                  className="green-border"
                                  src={
                                    "https://ipfs.io/" +
                                    item.thumbnail.replace(":/", "")
                                  }
                                  width="100%"
                                  height="auto"
                                  alt="NFT"
                                />
                              ) : (
                                <img
                                  className="green-border"
                                  src={item.thumbnail}
                                  width="100%"
                                  height="auto"
                                  alt="NFT"
                                />
                              )}
                            </div>

                            <div className="col-9">
                              <div className="d-flex justify-content-between">
                                <Card.Title>{item.name}</Card.Title>
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedNFT[index] || false}
                                  onChange={(e) => selectNFT(e, item.id)}
                                />
                              </div>

                              <p className="font-14 mb-0">{item.description}</p>
                              <p className="text-grey mb-0">#{item.id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {nftIDs.length > 0 ? (
                    <>
                      {txProgress && txType === "addNFT" ? (
                        <Button
                          className="blue-bg border-none border-radius-none mt-5 me-3"
                          disabled
                        >
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                      ) : (
                        <Button
                          className="blue-bg border-none border-radius-none mt-5 me-3"
                          onClick={() => addNFT()}
                        >
                          ADD NFT(S) TO SAFE
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      className="blue-bg border-none border-radius-none mt-5 me-3"
                      disabled
                    >
                      ADD NFT(S) TO SAFE
                    </Button>
                  )}
                </Tab.Pane>
              )}
              {step === "removenfts" && (
                <Tab.Pane eventKey="first">
                  <div className="d-flex justify-content-between pt-2 mx-2 border-bottom-green">
                    <h4 className="blue-font">EDIT NFT(S)</h4>
                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-1"
                      size={24}
                      onClick={() => setStep("editnftcollection")}
                    />
                  </div>

                  <div className="row p-3">
                    {nft.length > 0 &&
                      nft.map(
                        (item, index) =>
                          showNFT[index] && (
                            <div className="col-md-4 d-flex" key={index}>
                              <div className="row grey-border p-2 me-2 mt-2">
                                <div className="col-3 p-1">
                                  {item.thumbnail.includes("ipfs") ? (
                                    <img
                                      className="green-border"
                                      src={
                                        "https://ipfs.io/" +
                                        item.thumbnail.replace(":/", "")
                                      }
                                      width="100%"
                                      height="auto"
                                      alt="NFT"
                                    />
                                  ) : (
                                    <img
                                      className="green-border"
                                      src={item.thumbnail}
                                      width="100%"
                                      height="auto"
                                      alt="NFT"
                                    />
                                  )}
                                </div>

                                <div className="col-9">
                                  <div className="d-flex justify-content-between">
                                    <Card.Title className="me-2">
                                      {item.name}
                                    </Card.Title>

                                    <img
                                      className="cursor-pointer"
                                      src="remove-button.png"
                                      alt=""
                                      width="20px"
                                      height="20px"
                                      onClick={() =>
                                        toggleNFTVisibility(index, item.id)
                                      }
                                    />
                                  </div>

                                  <p className="font-14 mb-0">
                                    {item.description}
                                  </p>
                                  <p className="text-grey mb-0">#{item.id}</p>
                                </div>
                              </div>
                            </div>
                          )
                      )}
                  </div>

                  <div className="row p-3 pt-0">
                    <div className="col-md-6 px-0">
                      <div className="d-flex mt-3">
                        <img
                          className="mt-1 me-2"
                          src="remove-button.png"
                          alt=""
                          width="20px"
                          height="20px"
                        />
                        <h5>= Remove NFT from Safe</h5>
                      </div>
                      <p className="text-warning px-1">
                        <FaInfo /> By removing all the NFTs you would delegate
                        wondership of all your collection's NFTs.
                      </p>
                    </div>

                    <div className="col-md-6">
                      {txProgress && txType === "editNFT" ? (
                        <Button
                          className="blue-bg border-none border-radius-none mt-3"
                          disabled
                        >
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </Button>
                      ) : (
                        <Button
                          className="blue-bg border-none border-radius-none mt-3"
                          onClick={() => editNFT()}
                        >
                          SAVE CHANGES TO NFT(S)
                        </Button>
                      )}
                    </div>
                  </div>
                </Tab.Pane>
              )}
            </>

            {/* Pledge */}
            <>
              {pledgeStep === "default" && (
                <Tab.Pane eventKey="second">
                  <div className="row gap-sm-0 gap-2">
                    {pledge &&
                      pledge.map((item, index) => (
                        <div className="col-xl-3 col-lg-4 col-sm-6" key={index}>
                          <Card
                            className="text-center cursor-pointer h-100"
                            onClick={() => clickPledge(item)}
                          >
                            <Card.Img
                              className="item-img"
                              variant="top"
                              src="pleages.png"
                            />
                            <Card.Body className="p-0">
                              <Card.Title className="blue-font">
                                {item.name}
                              </Card.Title>
                              <p className="text-grey mb-0">{item.holder}</p>
                              <p className="font-14 mb-0 blue-font">
                                Created at
                              </p>
                              <p className="mb-1 blue-font">
                                {convertDate(Math.floor(item.createdAt * 1000))}
                              </p>

                              {Math.floor(Date.now() / 1000) >=
                                item.releasedAt ? (
                                <>
                                  <p className="text-success font-14 mb-0">
                                    Maturity Date
                                  </p>
                                  <p className="text-success">
                                    {convertDate(
                                      Math.floor(item.releasedAt * 1000)
                                    )}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="red-font font-14 mb-0">
                                    Maturity Date
                                  </p>
                                  <p className="red-font">
                                    {convertDate(
                                      Math.floor(item.releasedAt * 1000)
                                    )}
                                  </p>
                                </>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                  </div>

                  {pledge && pledge.length === 0 && (
                    <div className="center-pad text-center">
                      <h1>There's no pledges</h1>
                    </div>
                  )}
                </Tab.Pane>
              )}

              {pledgeStep === "item" && (
                <Tab.Pane eventKey="second">
                  <div className="row p-3 mb-3">
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-3 d-flex green-border main-avatar">
                          <img
                            src="pleages.png"
                            width="100%"
                            height="auto"
                            alt="pledge"
                          />
                        </div>

                        <div className="col-md-9 text-center text-md-start">
                          <h5 className="blue-font">{pledgeItem.name}</h5>
                          <p className="blue-font mb-0">
                            {pledgeItem.description}
                          </p>
                          <p className="text-grey">{pledgeItem.holder}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 text-webkit-right">
                      <p className="font-bold maturity-date blue-bg border-none">
                        MATURITY DATE:{" "}
                        {convertDate(Math.floor(pledgeItem.releasedAt * 1000))}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between border-bottom-green">
                    <h4 className="p-2 blue-font mb-0">
                      COIN(S)
                      <Button
                        className="mx-3"
                        disabled={coinWithdrawButtonDisable}
                        variant="danger"
                        size="sm"
                        onClick={() => withdrawCoins()}
                      >
                        WITHDRAW
                      </Button>
                    </h4>

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setPledgeStep("default")}
                    />
                  </div>

                  {pledgeItem !== null &&
                    pledgeItem.fungibleTokens.length > 0 ? (
                    <div className="d-flex mt-2">
                      {pledgeItem.fungibleTokens.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className="text-center">
                            <img
                              src={
                                logoURI[
                                getFTContractNameAddress(item.identifier)
                                  .contractName
                                ]
                              }
                              width="60px"
                              height="auto"
                              alt="token Logo"
                            />
                            {parseFloat(item.balance) ===
                              parseFloat(
                                tokenHoldAmount[
                                getFTContractNameAddress(item.identifier)
                                  .contractName
                                ]
                              ) ? (
                              <h6 className="text-center">(All)</h6>
                            ) : (
                              <h6 className="text-center">
                                ({parseInt(item.balance)})
                              </h6>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="d-flex mt-4 mb-5">
                      <h5 className="blue-font mx-3 align-self-center">
                        There's No coins to withdraw!
                      </h5>
                    </div>
                  )}

                  <h4 className="p-2 border-bottom-green blue-font">
                    NFT COLLECTION(S)
                    {/* <Button className='mx-3' variant="danger" size="sm">WITHDRAW</Button> */}
                  </h4>
                  {pledgeItem && pledgeItem.nonFungibleTokens.length > 0 ? (
                    <div className="row overflow-auto">
                      {pledgeCollection &&
                        pledgeCollection.map((item, index) => (
                          <div
                            className="col-lg-3 col-md-4 col-sm-6 pt-2"
                            key={index}
                          >
                            <Card className="p-3 pb-1 h-100 cursor-pointer">
                              <Card.Img
                                variant="top"
                                src={item.collectionBannerImage}
                              />
                              <Card.Body className="pb-0">
                                <div className="row">
                                  <div className="col-3 p-0">
                                    <img
                                      className="nft-img"
                                      src={item.collectionSquareImage}
                                      width="100%"
                                      height="auto"
                                      alt="collection"
                                    />
                                    <div className="d-inline">
                                      <h6 className="d-inline">(</h6>
                                      <NftId lockUp={pledgeItem} item={item} />
                                      <h6 className="d-inline">)</h6>
                                    </div>
                                  </div>

                                  <div className="col-9">
                                    <p className="font-bold">
                                      {item.contractName}
                                    </p>
                                    <div className="d-flex">
                                      <p className="text-grey font-14 d-none d-xl-block">
                                        {item.collectionDescription}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-grey font-14 d-block d-xl-none">
                                    {item.collectionDescription}
                                  </p>
                                  <Button
                                    className="mw-50"
                                    disabled={
                                      !(
                                        pledgeItemNFTCount(pledgeItem, item) > 0
                                      )
                                    }
                                    variant="danger"
                                    size="sm"
                                    onClick={() => withdrawNFTCollection(item)}
                                  >
                                    WITHDRAW
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <h5 className="blue-font mx-3 align-self-center">
                      NO NFT(S)
                    </h5>
                  )}
                </Tab.Pane>
              )}

              {pledgeStep === "coins" && (
                <Tab.Pane eventKey="second">
                  <div className="d-flex justify-content-between border-bottom-green">
                    <h4 className="p-2 mb-0 blue-font">COIN(S)</h4>

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-10"
                      size={24}
                      onClick={() => setPledgeStep("item")}
                    />
                  </div>

                  {pledgeItem !== null &&
                    pledgeItem.fungibleTokens.length > 0 ? (
                    <div className="row p-3">
                      {pledgeItem.fungibleTokens.map((item, index) => (
                        <div className="col-md-4" key={index}>
                          <div className="grey-border p-2">
                            <div className="row">
                              <div className="col-md-3">
                                <img
                                  src={
                                    logoURI[
                                    getFTContractNameAddress(item.identifier)
                                      .contractName
                                    ]
                                  }
                                  width="100%"
                                  height="auto"
                                  alt="token logo"
                                />
                                <h5 className="text-center">
                                  ({parseInt(item.balance)})
                                </h5>
                              </div>

                              <div className="col-md-9">
                                <h5 className="blue-font mb-0">FLOW</h5>
                                <p className="text-grey mb-1">
                                  {pledgeItem.holder}
                                </p>

                                <div className="row">
                                  <div className="col-9 pr-0">
                                    <Form.Control
                                      className="mb-1"
                                      type="text"
                                      placeholder="Enter quantity of Coin(s)"
                                      value={
                                        withdrawCoinsAmount[
                                        getFTContractNameAddress(
                                          item.identifier
                                        ).contractName
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        onHandleChangeWithdrawCoinsAmount(
                                          e,
                                          getFTContractNameAddress(
                                            item.identifier
                                          ).contractName
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="col-3">
                                    {txProgress && txType === "withDrawFT" ? (
                                      <Spinner animation="border" role="status">
                                        <span className="visually-hidden">
                                          Loading...
                                        </span>
                                      </Spinner>
                                    ) : (
                                      <img
                                        className="withdraw-img p-1 cursor-pointer"
                                        src="withdraw-icon.png"
                                        width="100%"
                                        height="auto"
                                        onClick={() =>
                                          withDrawFT(pledgeItem.holder, item)
                                        }
                                        alt="withdraw"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="d-flex mt-3">
                        <img
                          className="mt-1 me-2"
                          src="withdraw-icon.png"
                          alt=""
                          width="20px"
                          height="20px"
                        />
                        <h5>= Press to withdraw</h5>
                      </div>
                      <p className="text-warning px-1">
                        <FaInfo />
                        By not specifying an amount you can withdraw the maximum
                        amount.
                      </p>
                    </div>
                  ) : (
                    <h5 className="text-warning">
                      There's no coins to withdraw!
                    </h5>
                  )}
                </Tab.Pane>
              )}

              {pledgeStep === "nftcollection" && (
                <Tab.Pane eventKey="second">
                  <h4 className="p-2 border-bottom-green blue-font">
                    SELECT NFT COLLECTION TO WITHDRAW NFT(S)
                  </h4>

                  <div className="row">
                    <div className="col-md-4 pt-2">
                      <Card
                        className="p-3 pb-1 cursor-pointer"
                        onClick={() => setPledgeStep("nfts")}
                      >
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
                                  Lorem ipsum dolor Lorem <br />
                                  Lorem ipsum dolor Lorem
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="col-md-4 pt-2">
                      <Card className="p-3 pb-1">
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
                                  Lorem ipsum dolor Lorem <br />
                                  Lorem ipsum dolor Lorem
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="col-md-4 pt-2">
                      <Card className="p-3 pb-1">
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
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

                  <div className="row">
                    <div className="col-md-4 pt-2">
                      <Card className="p-3 pb-1">
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
                                  Lorem ipsum dolor Lorem <br />
                                  Lorem ipsum dolor Lorem
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="col-md-4 pt-2">
                      <Card className="p-3 pb-1">
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
                                  Lorem ipsum dolor Lorem <br />
                                  Lorem ipsum dolor Lorem
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>

                    <div className="col-md-4 pt-2">
                      <Card className="p-3 pb-1">
                        <Card.Img variant="top" src="nfts.png" />
                        <Card.Body className="pb-0">
                          <div className="row">
                            <div className="col-3 p-0">
                              <img
                                className="nft-img"
                                src="nft.png"
                                width="100%"
                                height="auto"
                                alt="NFT"
                              />
                              <h5 className="text-center">(7)</h5>
                            </div>

                            <div className="col-9">
                              <Card.Title>Lorem ipsum dolor</Card.Title>
                              <div className="d-flex">
                                <p className="text-grey font-14 mb-0">
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
              )}

              {pledgeStep === "nfts" && (
                <Tab.Pane eventKey="second">
                  <div className="d-flex justify-content-between border-bottom-green">
                    <h4 className="blue-font p-2 mb-0">NFT(S)</h4>
                    <Form.Check
                      type="checkbox"
                      label="Select All NFTs"
                      checked={checkWithdrawAllNFT}
                      onChange={(e) => selectAllWithdrawNFT(e)}
                    />

                    <FaArrowLeft
                      className="blue-font cursor-pointer mt-1"
                      size={24}
                      onClick={() => setPledgeStep("item")}
                    />
                  </div>

                  <div className="row p-3">
                    {pledgeNFT.length > 0 &&
                      pledgeNFT.map((item, index) => (
                        <div className="col-md-4" key={index}>
                          <div className="row grey-border p-2 me-2 mt-2">
                            <div className="col-3 p-1">
                              {item.thumbnail.includes("ipfs") ? (
                                <img
                                  className="green-border"
                                  src={
                                    "https://ipfs.io/" +
                                    item.thumbnail.replace(":/", "")
                                  }
                                  width="100%"
                                  height="auto"
                                  alt="NFT"
                                />
                              ) : (
                                <img
                                  className="green-border"
                                  src={item.thumbnail}
                                  width="100%"
                                  height="auto"
                                  alt="NFT"
                                />
                              )}
                            </div>

                            <div className="col-9">
                              <div className="d-flex justify-content-between">
                                <Card.Title>{item.name}</Card.Title>
                                <Form.Check
                                  type="checkbox"
                                  checked={changeSelection[index]}
                                  onChange={(e) =>
                                    selectWithdrawNFT(e, item.id, index)
                                  }
                                />
                              </div>

                              <p className="font-14 mb-0">{item.description}</p>
                              <p className="text-grey mb-0">#{item.id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="row mt-3 p-3">
                    <div className="col-md-8">
                      <h5 className="text-warning">
                        <FaInfo /> Please select NFTs to withdraw
                      </h5>
                    </div>

                    <div className="col-md-4">
                      {withdrawNFTIDs.length > 0 ? (
                        <>
                          {txProgress && txType === "withdrawNFT" ? (
                            <Button
                              className="blue-bg border-none border-radius-none mt-3"
                              disabled
                            >
                              <Spinner animation="border" role="status">
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </Spinner>
                            </Button>
                          ) : (
                            <Button
                              className="blue-bg border-none border-radius-none mt-3"
                              onClick={() => withdrawNFT()}
                            >
                              WITHDRAW NFT(S)
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          className="blue-bg border-none border-radius-none mt-3"
                          disabled
                        >
                          WITHDRAW NFT(S)
                        </Button>
                      )}
                    </div>
                  </div>
                </Tab.Pane>
              )}
            </>
          </Tab.Content>
        </div>
      </div>

      <ToastContainer hideProgressBar />
    </Tab.Container>
  );
}
