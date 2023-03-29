import { Form, Accordion } from "react-bootstrap";

export default function Home(){
  return(
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
            Search for BACKUP WALLET
          </h5>
          <div className="d-flex justify-content-center">
            <Form.Control type="text" className="mt-2 search-input" />
          </div>
        </div>        
      </div>

      <Accordion defaultActiveKey="0" alwaysOpen className="mt-5 mb-5">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit?
          </Accordion.Header>
          <Accordion.Body>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit?
          </Accordion.Header>
          <Accordion.Body>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit?
          </Accordion.Header>
          <Accordion.Body>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}