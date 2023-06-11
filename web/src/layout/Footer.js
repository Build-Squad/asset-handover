export default function Footer() {
  return (
    <div className="footer d-flex justify-content-between">
      <div className="d-flex">
        <p className="text-white font-bold me-3">
          Made by{" "}
          <a href="https://buildsquad.net" target="_blank" rel="noreferrer">
            BuildSquad
          </a>{" "}
          with
        </p>
        <img src="Footer-heart.png" width="25px" height="25px" alt="Footer" />
      </div>

      <div>
        <div className="d-flex flex-reverse">
          <a
            href="https://github.com/Build-Squad"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="footer-github.png"
              alt="Github logo"
              width="25px"
              height="25px"
            ></img>
          </a>
          <a
            className="me-2"
            href="https://www.linkedin.com/company/build-squad"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="footer-linkedin.png"
              alt="LinkedIn logo"
              width="25px"
              height="25px"
            ></img>
          </a>
          <a
            className="me-2"
            href="https://twitter.com/build_squad"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="footer-twitter.png"
              alt="Twitter logo"
              width="25px"
              height="25px"
            ></img>
          </a>
          <a
            className="me-2"
            href="https://medium.com/@build_squad"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="footer-medium.png"
              alt="Medium logo"
              width="25px"
              height="25px"
            ></img>
          </a>
          <p className="text-white font-bold me-3">Follow us</p>
        </div>
      </div>
    </div>
  );
}
