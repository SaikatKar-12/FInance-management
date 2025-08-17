import { Link } from 'react-router-dom';
import '../assets/styles/welcome.css';
import { FiPieChart, FiTrendingUp, FiDollarSign, FiBarChart2, FiCreditCard, FiShield } from 'react-icons/fi';
import financeImage from '../assets/images/4_financical_2x-1.png';

function Welcome() {
    return (
        <div className="welcome-container">
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-image">
                        <img src={financeImage} alt="Financial management illustration" />
                    </div>
                    <div className="hero-content">
                        <h1>Take Control of Your Finances</h1>
                        <h2><span className="app-name">SpendBook</span> helps you track expenses, manage budgets, and achieve your financial goals with ease.</h2>
                        
                        <div className="cta-buttons">
                            <Link to="/auth/register" className="primary-btn">Get Started for Free</Link>
                            <Link to="/auth/login" className="secondary-btn">Sign In</Link>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiPieChart />
                        </div>
                        <h4>Expense Tracking</h4>
                        <p>Easily track your spending across categories and see where your money goes each month.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiTrendingUp />
                        </div>
                        <h4>Budget Planning</h4>
                        <p>Set and manage budgets to control your spending and save more effectively.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiDollarSign />
                        </div>
                        <h4>Financial Insights</h4>
                        <p>Get detailed reports and visualizations of your financial health and spending patterns.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiBarChart2 />
                        </div>
                        <h4>Smart Analytics</h4>
                        <p>Advanced analytics to help you understand and optimize your financial decisions.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiCreditCard />
                        </div>
                        <h4>Multi-Account</h4>
                        <p>Manage all your bank accounts and credit cards in one secure place.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiShield />
                        </div>
                        <h4>Secure & Private</h4>
                        <p>Bank-level security to keep your financial data safe and private.</p>
                    </div>
                </div>
            </section>
            
            <footer className="welcome-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>SpendBook</h3>
                        <p>Your personal finance companion for a better financial future.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/auth/register">Sign Up</Link></li>
                            <li><Link to="/auth/login">Sign In</Link></li>
                            <li><Link to="/#features">Features</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <p>Email: support@spendbook.app</p>
                        <div className="social-links">
                            <button className="social-btn" aria-label="Twitter">
                                <i className="fab fa-twitter"></i>
                            </button>
                            <button className="social-btn" aria-label="Facebook">
                                <i className="fab fa-facebook"></i>
                            </button>
                            <button className="social-btn" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </button>
                            <button className="social-btn" aria-label="LinkedIn">
                                <i className="fab fa-linkedin"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Developed By</h4>
                        <div className="developer-info">
                            <div className="developer-name">Saikat Kar</div>
                            <div className="developer-role">Full Stack Developer</div>
                            <div className="developer-links">
                                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <i className="fab fa-github"></i>
                                </a>
                                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin"></i>
                                </a>
                                <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer" aria-label="Portfolio">
                                    <i className="fas fa-globe"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} SpendBook. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Welcome;