import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return(
    <div className="row justify-content-between mt-5">
      <div className='col-md-6'>
        <p className="text-white font-bold">
          Made by BLOCKCHAINNOOSE S.R.L with ❤
        </p>
      </div>
      
      <div className='col-md-6'>
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