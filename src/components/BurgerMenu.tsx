import { slide as Menu } from 'react-burger-menu';
import './BurgerMenu.css';
import { Link } from 'react-router-dom';

const BurgerMenu = () => {
  return (
    <Menu>
      <Link className="menu-item" to="/">
        Home
      </Link>
      <Link className="menu-item" to="/about">
        About
      </Link>
      <Link className="menu-item" to="/contact">
        Contact
      </Link>
    </Menu>
  );
};

export default BurgerMenu;
