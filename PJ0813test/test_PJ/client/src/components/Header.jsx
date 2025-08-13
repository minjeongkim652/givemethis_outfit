import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
    <header className="main-header">
        <div className="header-container">
            <Link to="/Main" className="logo-link">
                <img src="/imsilogo.png" alt="로고" className="headerlogo" />
            </Link>
            <nav className="navigation">
                <Link to="/worldcup">스타일 월드컵</Link> | <Link to="/testo">에겐테토녀</Link> |{' '}
                <Link to="/chat">챗봇</Link>
            </nav>
        </div>
    </header>
);

export default Header;
