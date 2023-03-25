import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return(
    <div className="d-flex justify-content-between">
      <p className="text-white font-bold">
        Made by BLOCKCHAINNOOSE S.R.L with ❤
      </p>

      <div className="d-flex">
        <p className="text-white font-bold me-3">
          Follow us
        </p>

        <FaLinkedin className='text-white me-2 mt-1' size={20} />
        <FaGithub className='text-white mt-1' size={20} />
      </div>
    </div>
  )
}