import React from "react";
import "../styles/header.css"
import logo from "../assets/logo.svg";

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <div className="brand">
          {/* Используем класс вместо inline-стиля */}
          <img src={logo} alt="JustGoIt" className="site-logo" />
        </div>

        <nav className="header-nav" aria-label="Main navigation">
          <ul>
            <li><a href="#questions">Вопросы/Ответы</a></li>
            <li><a href="#learning">Learning</a></li>
            <li><a href="#livecoding">LiveCoding</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}