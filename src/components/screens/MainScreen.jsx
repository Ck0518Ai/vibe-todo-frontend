import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import CategoryList from '../main/CategoryList';
import WeekCalendar from '../main/WeekCalendar';

export default function MainScreen() {
  const {
    topMenuOpen, setTopMenuOpen, setScreen, openAddCategoryForm,
  } = useApp();
  const menuWrapRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (topMenuOpen && !e.target.closest('.top-bar__menu-wrap')) {
        setTopMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [topMenuOpen, setTopMenuOpen]);

  function handleMenuAction(action) {
    setTopMenuOpen(false);
    switch (action) {
      case 'category-add':
        openAddCategoryForm('main');
        break;
      case 'category-manage':
        setScreen('categoryManage');
        break;
      case 'routine':
        setScreen('routine');
        break;
      case 'reminder':
        setScreen('reminder');
        break;
      default:
        break;
    }
  }

  return (
    <div className="screen screen--active">
      <div className="app">
        <header className="top-bar">
          <div className="toggle-group">
            <button type="button" className="toggle-btn toggle-btn--active">나</button>
            <button type="button" className="toggle-btn">그룹</button>
          </div>
          <div className="top-bar__menu-wrap" ref={menuWrapRef}>
            <button
              type="button"
              className="menu-toggle"
              aria-label="메뉴"
              onClick={(e) => { e.stopPropagation(); setTopMenuOpen(!topMenuOpen); }}
            >
              <span className="hamburger" />
            </button>
            {!topMenuOpen ? null : (
              <div className="top-menu">
                <button type="button" className="top-menu__item" onClick={() => handleMenuAction('category-add')}>
                  카테고리 등록
                </button>
                <button type="button" className="top-menu__item" onClick={() => handleMenuAction('category-manage')}>
                  카테고리 관리
                </button>
                <button type="button" className="top-menu__item" onClick={() => handleMenuAction('routine')}>
                  루틴 관리
                </button>
                <button type="button" className="top-menu__item" onClick={() => handleMenuAction('reminder')}>
                  리마인더 관리
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="profile">
          <div className="profile__avatar">
            <img src="/assets/one-logo.png" alt="ONE" className="profile__logo" />
          </div>
          <div className="profile__info">
            <span className="profile__label">프로필</span>
            <span className="profile__name">나의 할일</span>
          </div>
        </section>

        <WeekCalendar />
        <CategoryList />

        <footer className="footer-bar">
          <div className="footer-bar__ai">
            <span className="footer-bar__ai-icon">✦</span>
            <span>AI</span>
          </div>
          <button type="button" className="footer-bar__menu">리스트 메뉴 ☰</button>
        </footer>

        <nav className="bottom-nav">
          <button type="button" className="bottom-nav__item bottom-nav__item--active" aria-label="홈">⌂</button>
          <button type="button" className="bottom-nav__item" aria-label="탐색">◎</button>
          <button type="button" className="bottom-nav__item" aria-label="알림">🔔</button>
          <button type="button" className="bottom-nav__item" aria-label="메시지">💬</button>
          <button type="button" className="bottom-nav__item" aria-label="프로필">👤</button>
        </nav>
      </div>

      {!topMenuOpen ? null : (
        <div className="menu-backdrop" onClick={() => setTopMenuOpen(false)} />
      )}
    </div>
  );
}
