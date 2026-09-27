import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <p>&copy; {currentYear} Yuhsuan All Rights Reserved.</p>
        </footer>
    );
}

export default Footer;