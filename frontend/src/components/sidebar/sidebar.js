import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthService from '../../services/auth.service';
import '../../assets/styles/sidebar.css';
import SideBarLinks from './sideBarLinks';
import AuthVerify from '../../services/auth.verify';
import Logo from '../utils/Logo';

function Sidebar({ activeNavId }) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) {
                setIsSideBarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSideBarOpen(!isSideBarOpen);
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsSideBarOpen(false);
        }
    };

    const logout = () => {
        AuthService.logout_req();
        navigate('/');
        window.location.reload();
    };

    // Close sidebar when clicking on a link on mobile
    const handleNavClick = () => {
        if (isMobile) {
            closeSidebar();
        }
    };

    return (
        <>
            {isMobile && (
                <button 
                    className="mobile-menu-btn" 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    <i className="fa fa-bars" />
                </button>
            )}

            <div className={`side-bar ${isSideBarOpen ? 'open' : ''}`}>
                <div className="logo-container">
                    <Logo />
                    {isMobile && (
                        <button 
                            onClick={closeSidebar}
                            className="close-btn"
                            aria-label="Close menu"
                        >
                            <i className="fa fa-times" />
                        </button>
                    )}
                </div>

                <ul>
                    {SideBarLinks.filter(
                        (link) =>
                            AuthService.getCurrentUser() &&
                            AuthService.getCurrentUser().roles.includes(link.role)
                    ).map((link) => (
                        <Link
                            key={link.id}
                            className="nav-link"
                            to={link.to}
                            onClick={handleNavClick}
                        >
                            <li className={activeNavId === link.id ? 'active' : ''}>
                                <i className={link.icon} aria-hidden="true" />
                                {link.name}
                            </li>
                        </Link>
                    ))}
                </ul>

                <div className="logout-btn" onClick={logout}>
                    <i className="fa fa-sign-out" aria-hidden="true" />
                    Log out
                </div>

                <AuthVerify logOut={logout} />
            </div>

            {isSideBarOpen && isMobile && (
                <div className="mobile-overlay" onClick={closeSidebar} />
            )}
        </>
    );
}

export default Sidebar;