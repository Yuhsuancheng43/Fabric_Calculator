import './Header.css';

function Header() {
  return (
    <header className="header">
        <span className="header-spacer"></span>
        <h1 className="header-title">Fabric Calculator</h1>
        <a href="https://github.com/Yuhsuancheng43" target="_blank" rel="noopener noreferrer" className="profile-link">
          <img src="/favicon.jpeg" alt="Yuhsuan's GitHub profile" className="profile-picture"/>
        </a>
    </header>
  );
}

export default Header;
