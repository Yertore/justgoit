import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-col footer-col--brand">
          {/* compact inline logo */}
          <a href="/" className="footer-logo" aria-label="JustGoIt — home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" role="img" aria-hidden="true">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#00C5E6"/>
                  <stop offset="1" stopColor="#006ECD"/>
                </linearGradient>
              </defs>
              <rect x="8" y="8" width="264" height="64" rx="12" fill="url(#g)"/>
              <text x="140" y="48" textAnchor="middle"
                    fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial"
                    fontWeight="800" fontSize="28" fill="#fff">
                <tspan>Just</tspan><tspan fill="#FFD166">Go</tspan><tspan>It</tspan>
              </text>
            </svg>
          </a>

          <p className="footer-desc">
            Короткие практические ответы и уроки по Go. Сообщество людей — помощь и разбор задач.
          </p>
        </div>

        <nav className="footer-col" aria-label="Footer navigation">
          <h4 className="footer-title">Разделы</h4>
          <ul className="footer-list">
            <li><a href="#questions">Вопросы/Ответы</a></li>
            <li><a href="#learning">Обучение</a></li>
            <li><a href="#livecoding">LiveCoding</a></li>
            <li><a href="/about">О проекте</a></li>
          </ul>
        </nav>

        <div className="footer-col">
          <h4 className="footer-title">Сообщество</h4>
          <ul className="footer-list">
            <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://t.me/" target="_blank" rel="noopener noreferrer">Telegram</a></li>
            <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          </ul>
        </div>

        <div className="footer-col footer-col--subscribe">
          <h4 className="footer-title">Подписка</h4>
          <p className="footer-small">Получайте новые вопросы и подборки по почте</p>
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="footer-email" className="visually-hidden">Email</label>
            <input id="footer-email" type="email" placeholder="Ваш email" required />
            <button type="submit">Подписаться</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-inner footer-bottom-inner">
          <p className="copyright">© {new Date().getFullYear()} JustGoIt. Все права защищены.</p>
          <ul className="legal-list">
            <li><a href="/privacy">Политика конфиденциальности</a></li>
            <li><a href="/terms">Условия</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}