import hamburgerIcon from './assets/hamburger.svg'

function HamburgerMenu({ isOpen, setOpen }) {
    return(
        <button 
          onClick={() => setOpen(!isOpen)} 
          className="hamburger-btn"
          aria-label="Menu"
          title="Toggle Menu"
        >
          <img src={hamburgerIcon} alt="Menu" />
        </button>
    )
}

export default HamburgerMenu