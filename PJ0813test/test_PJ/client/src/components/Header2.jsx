import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header2 = () => (
    <header className="main-header">
        <div className="top-nav">
            <div className="nav-left">
                <Link to="/about">About</Link>
            </div>
            <div className="nav-right">
                <Link to="/worldcup">스타일 월드컵</Link>
                <Link to="/testo">에겐테토녀</Link>
                <Link to="/chat">챗봇</Link>
            </div>
        </div>
        <div className="logo-container">
            
                <img src="/logo2.jpg" alt="로고" className="main-logo" />
      
        </div>
    </header>
);

export default Header2;
