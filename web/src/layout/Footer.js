import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <div className="footer d-flex justify-content-between">
      <div className='d-flex'>
        <p className="text-white font-bold me-3">
          Made by BLOCKCHAINNOOSE S.R.L with
        </p>
        <img src="Footer-heart.png" width="25px" height="25px" />
      </div>

      <div>
        <div className="d-flex flex-reverse">
          <img src="footer-github.png" width="25px" height="25px" />
          <img className='me-2' src="footer-linkedin.png" width="25px" height="25px" />
          <p className="text-white font-bold me-3">
            Follow us
          </p>
        </div>
      </div>
    </div>
  )
}