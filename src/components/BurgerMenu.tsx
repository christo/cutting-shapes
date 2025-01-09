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
      <div>
        show fps
      </div>
      <div>
        show camera feed
      </div>
      <div>
        record / playback / live
      </div>
      <div>
        debug
      </div>
    </Menu>
  );
};

export default BurgerMenu;
