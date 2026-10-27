import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="site-footer">
      <p>© {currentYear} StaySphere Private Limited</p>
      <nav aria-label="Legal links">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </nav>
    </footer>
  )
}

export default Footer
