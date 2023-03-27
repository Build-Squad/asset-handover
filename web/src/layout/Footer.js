import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <div className="footer d-flex justify-content-between">
      <div>
        <p className="text-white font-bold">
          Made by BLOCKCHAINNOOSE S.R.L with ❤
        </p>
      </div>

      <div>
        <div className="d-flex flex-reverse">
          <FaGithub className='text-white mt-1 me-2' size={20} />
          <FaLinkedin className='text-white me-2 mt-1' size={20} />
          <p className="text-white font-bold me-3">
            Follow us
          </p>
        </div>
      </div>
    </div>
  )
}