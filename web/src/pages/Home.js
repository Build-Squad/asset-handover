import { useState } from "react";
import { Form, Accordion } from "react-bootstrap";
import { isValidFlowAddress } from "../utils/utils";
import { getAccountLockUp } from "../cadence/script/getAccountLockUp";
import * as fcl from "@onflow/fcl";
import { ToastContainer, toast } from 'react-toastify';
import { Table, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { convertDate } from "../utils/utils";

export default function Home() {
  const [searchAddress, setSearchAddress] = useState("");
  const [lockUp, setLockup] = useState(null);
  const [clicked, setClicked] = useState(false);
  const onHandleChangeSearch = (e) => {
    setSearchAddress(e.target.value);
    setLockup(null);
    setClicked(false);
  }

  const onHandleSubmit = async (e) => {

    e.preventDefault();


    if (!isValidFlowAddress(searchAddress)) {
      toast.error("Please input correct flow address!");
      return;
    }
    const res = await fcl.query({
      cadence: getAccountLockUp,
      args: (arg, t) => [arg(searchAddress, t.Address)],
    });
    setClicked(true);
    if (!res) {
      toast.error("No Safe found for this account!");
      return;
    }
    setLockup(res);

  }
  return (
    <div className="row mt-5">
      <div className="col-md-4">
        <img src="Banner-Image.png" width="100%" height="auto" />
      </div>

      <div className="col-md-4 text-center m-auto mt-5">
        <h1 className="text-white mb-0">
          Protect Your
        </h1>
        <h1 className="header-font text-white font-80 mb-0">
          WEB3
        </h1>
        <h1 className="text-white font-50 mb-0">
          Footprint
        </h1>
      </div>

      <div className="col-md-4 mt-5 text-center d-flex search-pad">
        <div className="w-content">
          <h5 className="text-white">
            Search Safe By Account
          </h5>
          <div className="d-flex justify-content-center pb-2">
            <Form onSubmit={onHandleSubmit} className="position-relative">
              <FaSearch className="position-absolute top-50 translate-middle-y opacity-50" style={{ left: '15px' }} />
              <button className="position-absolute top-50 translate-middle-y opacity-50 background-transparent " style={{ right: '15px', borderRadius: '0.75rem', border: '1px solid #0000007A' }}>Enter</button>
              <Form.Control name="search" type="text" className="search-input" onChange={onHandleChangeSearch} style={{ padding: '10px 38px', paddingRight: 70 }} />
            </Form>
          </div>
          <div className="d-flex justify-content-center">
            {lockUp !== null ? (
              <Table bordered className="text-white" style={{ backgroundColor: "#0f0f32" }} >
                <tbody>
                  <tr>
                    <td>Holder:</td>
                    <td>{lockUp.holder}</td>
                  </tr>
                  <tr>
                    <td>Recipient:</td>
                    <td>{lockUp.recipient}</td>
                  </tr>
                  <tr>
                    <td>CreateAt:</td>
                    <td>{convertDate(Math.floor(lockUp.createdAt * 1000))}</td>
                  </tr>
                  <tr>
                    <td>MaturityDate:</td>
                    <td>{convertDate(Math.floor(lockUp.releasedAt * 1000))}</td>
                  </tr>
                </tbody>
              </Table>) : clicked &&
            <h5 className="text-center text-white"> No Safe found for this account!</h5>}
          </div>
        </div>
      </div>

      <Accordion defaultActiveKey="0" alwaysOpen className="mt-5 mb-5">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            What is FlowSafe?
          </Accordion.Header>
          <Accordion.Body>
            FlowSafe is a secure wallet solution built on the <a href="https://flow.com/">Flow blockchain</a> that allows
            account holders to create and manage individual safes for their assets.
            It provides a secure and accessible way to store and transfer assets to designated recipients
            while minimizing the risks associated with key loss or potential collusion.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            How does FlowSafe work?
          </Accordion.Header>
          <Accordion.Body>
            FlowSafe enables account holders to create a safe associated with their account.
            Each account holder can create one safe at a time. However, account holders have
            the flexibility to modify or delete their safe as needed. The safe represents the stored assets
            and has a designated recipient, each safe can have only one recipient designated to receive the assets,
            however, a recipient can be associated with multiple safes from different holders. The recipient can only
            withdraw the assets after the maturity date has elapsed. It's important to note that adding assets to the safe does not lock them;
            during this time, the account holder can freely transfer or manage their assets. The safe serves as a digital will,
            ensuring that the assets are transferred to the designated recipient after the maturity date has elapsed.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>
            What are the advantages of using FlowSafe?
          </Accordion.Header>
          <Accordion.Body>
            FlowSafe offers several key benefits:
            <ul>
              <li>
                <b>Security</b>: Assets stored in FlowSafe are protected on the Flow blockchain, ensuring a high level of security
                while minimizing the risk of funds disappearing due to the untrustworthiness of centralized entities.
              </li>
              <li>
                <b>Accessibility</b>: Account holders have control over their safe and can modify or delete it as needed.
                The designated recipient can withdraw the assets once the maturity date has passed, this feature
                allows for the recovery of funds even if the primary key is lost, enhancing accessibility and reducing
                the potential for permanent loss of funds.
              </li>
              <li>
                <b>Flexibility</b>: FlowSafe allows for the transfer of assets to designated recipients, providing flexibility for individuals
                to plan and manage their financial arrangements.
              </li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>
            Can I transfer my assets to multiple recipients?
          </Accordion.Header>
          <Accordion.Body>
            FlowSafe currently supports the creation of one safe per account holder with a single designated recipient.
            It does not allow for multiple recipients within a single safe. However, account holders have the flexibility
            to modify or delete their safe and create new safes with different recipients as needed.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>
            How do I create a new safe?
          </Accordion.Header>
          <Accordion.Body>
            To create a new safe in FlowSafe, navigate to the "Create New Safe" section and provide the necessary information such as the recipient's address,
            maturity date, name, and description. Once created, you can start adding assets to the safe.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>
            How do I add assets to a safe?
          </Accordion.Header>
          <Accordion.Body>
            After creating a safe, you can add assets to it by selecting the desired safe. You can specifythe type and quantity of assets
            you want to store in the safe, ensuring they meet the defined rules and requirements.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6">
          <Accordion.Header>
            Can I modify the details of a safe?
          </Accordion.Header>
          <Accordion.Body>
            Yes, you can modify the details of a safe in FlowSafe. The holder of a safe can update information such as the maturity date, name, description, and the recipient's address.
            Simply navigate to the specific safe and make the necessary changes.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7">
          <Accordion.Header>
            What happens when I delete a safe?
          </Accordion.Header>
          <Accordion.Body>
            When you delete a safe in FlowSafe, the safe itself is permanently removed from your account, the deletion of a safe is not reversible.
            However, the assets stored within the safe are not affected by the deletion. The assets remain in your account,
            but they are no longer associated with a specific safe. If you wish to delegate ownership of your assets to a trusted recipient,
            you will need to create a new safe and transfer the assets to that safe. Deleting a safe simply removes the organizational structure
            of the safe but does not impact the ownership or accessibility of the assets themselves.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="8">
          <Accordion.Header>
            What happens if the maturity date of a safe passes and they are not withdrawn?
          </Accordion.Header>
          <Accordion.Body>
            If the maturity date specified during the safe creation passes without the authorized recipient withdrawing the digital assets,
            the assets remain securely in the holder's account which retains control and ownership, and they can still be accessed and managed by as needed.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="9">
          <Accordion.Header>
            Is FlowSafe suitable for personal and organizational use?
          </Accordion.Header>
          <Accordion.Body>
            Yes, FlowSafe can be used for both personal and organizational asset management.
            Account holders can create a safe and designate a recipient based on their individual needs,
            whether it involves transferring assets to family members, business partners, or other entities.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <ToastContainer hideProgressBar />
    </div >
  )
}