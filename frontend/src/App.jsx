import { useEffect, useState } from 'react'
import './App.css'

import goatImage from './assets/goat1.jpg'
import cattleImage from './assets/cattle.jpg'
import sheepImage from './assets/sheep.jpg'
import pigImage from './assets/pig.jpg'
import poultryImage from './assets/poultry.jpg'
import rabbitImage from './assets/rabbit.jpg'

import SellerDashboard from './SellerDashboard'
import BuyerDashboard from './BuyerDashboard'
import AdminDashboard from './AdminDashboard'
import Login from './Login'
import Register from './Register'


const livestock = [
  {
    id: 1,
    name: 'Healthy Red Sokoto Goat',
    category: 'Goats',
    price: 85000,
    location: 'Uyo',
    image: goatImage,
    badge: 'Popular',
    description: 'Healthy, well-fed and ready for sale.',
  },
  {
    id: 2,
    name: 'White Fulani Cattle',
    category: 'Cattle',
    price: 450000,
    location: 'Eket',
    image: cattleImage,
    badge: 'Verified seller',
    description: 'Strong and healthy cattle from a local farm.',
  },
  {
    id: 3,
    name: 'Healthy Ram',
    category: 'Sheep',
    price: 120000,
    location: 'Ikot Ekpene',
    image: sheepImage,
    badge: 'Available',
    description: 'Well-raised ram, suitable for breeding.',
  },
  {
    id: 4,
    name: 'Local Broiler Chickens',
    category: 'Poultry',
    price: 12000,
    location: 'Uyo',
    image: poultryImage,
    badge: 'Available',
    description: 'Healthy birds raised by a local farmer.',
  },
  {
    id: 5,
    name: 'Healthy Farm Pig',
    category: 'Pigs',
    price: 95000,
    location: 'Oron',
    image: pigImage,
    badge: 'Available',
    description: 'Well-fed pig raised on a local farm.',
  },
  {
    id: 6,
    name: 'Farm-Raised Rabbits',
    category: 'Rabbits',
    price: 18000,
    location: 'Ikot Abasi',
    image: rabbitImage,
    badge: 'Available',
    description: 'Healthy rabbits available from a local breeder.',
  },
]

const categories = [
  'All',
  'Goats',
  'Cattle',
  'Sheep',
  'Pigs',
  'Poultry',
  'Rabbits',
]

const formatPrice = (price) =>
  `₦${price.toLocaleString('en-NG')}`

function App() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [marketplaceOpened, setMarketplaceOpened] = useState(false)

  const [showSellerDashboard, setShowSellerDashboard] = useState(false)
  const [showBuyerDashboard, setShowBuyerDashboard] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginRole, setLoginRole] = useState('buyer')
  const [showRegister, setShowRegister] = useState(false)
const [loggedInUser, setLoggedInUser] = useState(null)
const [popupMessage, setPopupMessage] = useState('')

  

const [showResetPassword, setShowResetPassword] = useState(false)
const [resetEmail, setResetEmail] = useState('')
const [resetToken, setResetToken] = useState('')
useEffect(() => {
  const params = new URLSearchParams(window.location.search)

  const emailFromUrl = params.get('email')
  const tokenFromUrl = params.get('token')

  if (emailFromUrl && tokenFromUrl) {
    setResetEmail(emailFromUrl)
    setResetToken(tokenFromUrl)
    setShowResetPassword(true)

    window.history.replaceState(
      {},
      '',
      window.location.pathname
    )
  }
}, [])

  const filteredLivestock = livestock.filter((animal) => {
    const matchesCategory =
      category === 'All' || animal.category === category

    const matchesSearch =
      animal.name.toLowerCase().includes(search.toLowerCase()) ||
      animal.location.toLowerCase().includes(search.toLowerCase()) ||
      animal.category.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const addToCart = (animal) => {
    setCart((current) => [...current, animal])
  }

  const removeFromCart = (index) => {
    setCart((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    )
  }
  if (showResetPassword) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f5f7f5',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault()

          const formData = new FormData(event.currentTarget)

          const newPassword = formData.get('newPassword')
          const confirmPassword = formData.get('confirmPassword')

          if (newPassword !== confirmPassword) {
            setPopupMessage('The passwords do not match.')
            return
          }

          if (newPassword.length < 8) {
            setPopupMessage(
              'Password must be at least 8 characters.'
            )
            return
          }

          try {
            const response = await fetch(
              'http://https://livesta-t0yd.onrender.com/auth/reset-password',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: resetEmail,
                  token: resetToken,
                  newPassword,
                }),
              }
            )

            const data = await response.json()

            if (!response.ok) {
              throw new Error(
                Array.isArray(data.message)
                  ? data.message.join(', ')
                  : data.message || 'Unable to reset password.'
              )
            }

           setShowResetPassword(false)
setResetEmail('')
setResetToken('')
setShowLogin(true)
setPopupMessage(
  'Your password has been reset successfully. You can now log in.'
)
          } catch (error) {
            setPopupMessage(
              error.message ||
                'Unable to reset your password.'
            )
          }
        }}
        style={{
          background: 'white',
          padding: '35px',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            color: '#174a32',
            marginBottom: '8px',
          }}
        >
          LIVESTA
        </h1>

        <p
          style={{
            color: '#718078',
            marginBottom: '25px',
          }}
        >
          Create a new password for your account.
        </p>

        <label
          style={{
            display: 'block',
            marginBottom: '7px',
            color: '#263b30',
          }}
        >
          New password
        </label>

        <input
          type="password"
          name="newPassword"
          placeholder="At least 8 characters"
          minLength={8}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d8e1da',
            borderRadius: '7px',
            marginBottom: '18px',
            boxSizing: 'border-box',
            fontSize: '15px',
          }}
        />

        <label
          style={{
            display: 'block',
            marginBottom: '7px',
            color: '#263b30',
          }}
        >
          Confirm new password
        </label>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Enter your password again"
          minLength={8}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d8e1da',
            borderRadius: '7px',
            marginBottom: '22px',
            boxSizing: 'border-box',
            fontSize: '15px',
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '13px',
            background: '#1d7047',
            color: 'white',
            border: 0,
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Reset password
        </button>

        <button
          type="button"
          onClick={() => {
            setShowResetPassword(false)
            setResetEmail('')
            setResetToken('')
          }}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            background: 'transparent',
            border: 0,
            color: '#286344',
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </form>
    </div>
  )
}

  if (showRegister) {
    return (
      <Register
        onHome={() => setShowRegister(false)}
        onRegistered={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
        initialRole={loginRole}
      />
    )
  }

  if (showLogin) {
    return (
      <Login
        onHome={() => setShowLogin(false)}
        onLoginSuccess={(user) => {
          setLoggedInUser(user)
          setShowLogin(false)

          if (user.role === 'seller') {
            setShowSellerDashboard(true)
          } else if (user.role === 'buyer') {
            setShowBuyerDashboard(true)
          } else if (user.role === 'admin') {
            setShowAdminDashboard(true)
          } else {
            setPopupMessage(`Welcome, ${user.fullName}!`)
          }
        }}
      />
    )
  }

  if (showBuyerDashboard) {
    return (
      <BuyerDashboard
        user={loggedInUser}
        livestock={livestock}
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onHome={() => setShowBuyerDashboard(false)}
        onLogout={() => {
          localStorage.removeItem('livestaToken')
          localStorage.removeItem('livestaUser')
          setLoggedInUser(null)
          setShowBuyerDashboard(false)
        }}
      />
    )
  }

  if (showAdminDashboard) {
    return (
      <AdminDashboard
        user={loggedInUser}
        onHome={() => setShowAdminDashboard(false)}
        onLogout={() => {
          localStorage.removeItem('livestaToken')
          localStorage.removeItem('livestaUser')
          setLoggedInUser(null)
          setShowAdminDashboard(false)
        }}
      />
    )
  }

  if (showSellerDashboard) {
    return (
      <SellerDashboard
        onHome={() => setShowSellerDashboard(false)}
      />
    )
  }

  return (
    <div className="livesta">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #fafaf7;
          color: #17251c;
        }

        button, input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .livesta {
          min-height: 100vh;
        }

        .topbar {
          background: #143d2b;
          color: white;
          text-align: center;
          padding: 9px 16px;
          font-size: 12px;
          letter-spacing: .3px;
        }

        .navbar {
          height: 76px;
          background: white;
          border-bottom: 1px solid #edf0eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 7%;
          gap: 24px;
          position: relative;
          z-index: 5;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #174a32;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -1px;
          text-decoration: none;
        }

        .brand-mark {
          width: 37px;
          height: 37px;
          border-radius: 12px;
          background: #1e6a43;
          display: grid;
          place-items: center;
          color: white;
          font-size: 22px;
        }

        .navlinks {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .navlinks a {
          text-decoration: none;
          color: #45544a;
          font-size: 14px;
          font-weight: 600;
        }

        .navlinks a:hover {
          color: #1d7549;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-btn, .sell-btn {
          border: 0;
          border-radius: 9px;
          padding: 11px 17px;
          font-size: 13px;
          font-weight: 700;
        }

        .login-btn {
          background: white;
          color: #214a34;
          border: 1px solid #dce5dd;
        }

        .sell-btn {
          background: #1d7047;
          color: white;
        }

        .cart-btn {
          border: 1px solid #dce5dd;
          border-radius: 9px;
          padding: 10px 13px;
          background: white;
          color: #214a34;
          font-weight: 700;
        }

        .hero {
          background:
            radial-gradient(ellipse at 85% 15%, rgba(119, 159, 95, .25), transparent 34%),
            linear-gradient(115deg, #123d2b 0%, #1d5739 62%, #2d6943 100%);
          color: white;
          padding: 75px 7% 80px;
          overflow: hidden;
          position: relative;
        }

        .hero-inner {
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: 35px;
        }

        .eyebrow {
          color: #c5e2b6;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .hero h1 {
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -2.5px;
          max-width: 650px;
          margin: 0 0 20px;
        }

        .hero h1 span {
          color: #b8db9c;
        }

        .hero-copy {
          color: #d8e7da;
          font-size: 16px;
          line-height: 1.8;
          max-width: 520px;
          margin-bottom: 30px;
        }

        .searchbox {
          background: white;
          border-radius: 12px;
          padding: 7px;
          display: flex;
          max-width: 550px;
          box-shadow: 0 15px 35px rgba(0,0,0,.15);
        }

        .searchbox input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          padding: 12px 14px;
          color: #24392c;
          background: transparent;
          font-size: 14px;
        }

        .searchbox button {
          border: 0;
          background: #e9a83d;
          color: #1e2d20;
          border-radius: 8px;
          padding: 0 22px;
          font-weight: 800;
        }

        .hero-note {
          margin-top: 18px;
          color: #d5e5d8;
          font-size: 12px;
        }

        .hero-art {
          min-height: 330px;
          display: grid;
          place-items: center;
          position: relative;
        }

        .hero-circle {
          width: min(570px, 100%);
          aspect-ratio: 1.5 / 1;
          border-radius: 50%;
          overflow: hidden;
          display: grid;
          place-items: center;
          position: relative;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .hero-animal {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        .floating-card {
          position: absolute;
          background: white;
          color: #1b3928;
          padding: 13px 17px;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
          font-size: 12px;
          font-weight: 700;
        }

        .floating-card small {
          display: block;
          color: #718074;
          font-weight: 500;
          margin-top: 4px;
        }

        .floating-one {
          left: 0;
          bottom: 38px;
        }

        .floating-two {
          right: 0;
          top: 42px;
        }

        .section {
          padding: 65px 7%;
          max-width: 1440px;
          margin: auto;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin-bottom: 26px;
        }

        .section-heading h2 {
          margin: 0 0 8px;
          font-size: 29px;
          letter-spacing: -1px;
        }

        .section-heading p {
          margin: 0;
          color: #778078;
          font-size: 14px;
        }

        .text-link {
          border: 0;
          background: transparent;
          color: #267449;
          font-size: 13px;
          font-weight: 800;
        }

        .category-list {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }

        .category-card {
          border: 1px solid #e8ece6;
          background: white;
          border-radius: 13px;
          padding: 20px 10px;
          text-align: center;
          color: #294332;
          transition: .2s ease;
        }

        .category-card:hover, .category-card.active {
          border-color: #2a754b;
          background: #f0f7ef;
          transform: translateY(-3px);
        }

        .category-icon {
          width: 100%;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .category-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category-card strong {
          font-size: 13px;
        }

        .listing-section {
          background: #f3f5f0;
          max-width: none;
        }

        .listing-inner {
          max-width: 1300px;
          margin: auto;
        }

        .listing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .animal-card {
          background: white;
          border: 1px solid #e7ebe4;
          border-radius: 15px;
          overflow: hidden;
          transition: .2s ease;
        }

        .animal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 35px rgba(28, 58, 37, .09);
        }

        .animal-picture {
          height: 190px;
          background: linear-gradient(135deg, #e5ecd9, #c9dcb9);
          display: grid;
          place-items: center;
          position: relative;
        }

        .animal-picture img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .animal-picture span {
          font-size: 95px;
          filter: drop-shadow(0 9px 6px rgba(0,0,0,.12));
        }

        .badge {
          position: absolute;
          top: 13px;
          left: 13px;
          background: white;
          color: #276a43;
          border-radius: 20px;
          padding: 6px 10px;
          font-size: 10px;
          font-weight: 800;
        }

        .animal-info {
          padding: 18px;
          position: relative;
          z-index: 2;
          background: #ffffff;
          color: #203b2a;
        }

        .animal-category {
          color: #43845b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .animal-info h3 {
          font-size: 17px;
          margin: 8px 0;
          color: #203b2a;
        }

        .animal-description {
          color: #7b857c;
          font-size: 12px;
          line-height: 1.6;
          min-height: 38px;
        }

        .animal-location {
          color: #6c786e;
          font-size: 12px;
          margin: 14px 0;
        }

        .animal-bottom {
          border-top: 1px solid #edf0eb;
          padding-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .price {
          color: #1c603b;
          font-size: 19px;
          font-weight: 850;
        }

        .add-btn {
          border: 0;
          border-radius: 8px;
          background: #1d7047;
          color: white;
          padding: 10px 13px;
          font-size: 12px;
          font-weight: 800;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px 20px;
          background: white;
          border-radius: 12px;
          color: #657368;
        }

        .benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-top: 25px;
        }

        .benefit {
          border: 1px solid #e7ece5;
          border-radius: 13px;
          padding: 23px;
          background: white;
        }

        .benefit-icon {
          font-size: 28px;
        }

        .benefit h3 {
          margin: 12px 0 7px;
          font-size: 15px;
        }

        .benefit p {
          margin: 0;
          color: #778078;
          font-size: 12px;
          line-height: 1.7;
        }

        .cta {
          background: #eaf1e5;
          border-radius: 18px;
          padding: 35px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .cta h2 {
          margin: 0 0 8px;
          font-size: 25px;
        }

        .cta p {
          margin: 0;
          color: #68756a;
          font-size: 13px;
        }

        .cta button {
          background: #1d7047;
          border: 0;
          color: white;
          padding: 14px 20px;
          border-radius: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .footer {
          background: #123725;
          color: white;
          padding: 40px 7%;
        }

        .footer-inner {
          max-width: 1300px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
        }

        .footer .brand {
          color: white;
        }

        .footer p {
          color: #c4d4c7;
          font-size: 12px;
          margin: 9px 0 0;
        }

        .footer-note {
          color: #c4d4c7;
          font-size: 12px;
        }
          /* =========================
   LIVESTA FOOTER FIX
   ========================= */

.footer-column {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 11px !important;
}

.footer-column h3 {
  margin: 0 0 7px !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 800 !important;
}

.footer-column a,
.footer-column button {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: #aebfb3 !important;
  font-family: inherit !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  text-decoration: none !important;
  cursor: pointer !important;
  text-align: left !important;
}

.footer-column a:hover,
.footer-column button:hover {
  color: white !important;
  text-decoration: none !important;
}

.footer-bottom {
  max-width: 1300px !important;
  margin: 55px auto 0 !important;
  padding: 22px 0 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;

  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;

  gap: 20px !important;
  color: #aebfb3 !important;
  font-size: 11px !important;
}

.footer-bottom-links {
  display: flex !important;
  align-items: center !important;
  gap: 20px !important;
}

.footer-bottom-links button {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: #aebfb3 !important;
  font-family: inherit !important;
  font-size: 11px !important;
  cursor: pointer !important;
}

.footer-bottom-links button:hover {
  color: white !important;
}

/* Mobile footer */

@media (max-width: 650px) {
  .footer {
    padding: 45px 5% 0 !important;
  }

  .footer-inner {
    grid-template-columns: 1fr !important;
    gap: 35px !important;
  }

  .footer-brand {
    max-width: 100% !important;
  }

  .footer-bottom {
    margin-top: 40px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 15px !important;
  }

  .footer-bottom-links {
    flex-wrap: wrap !important;
  }
}
  

        @media (max-width: 900px) {
          .navbar {
            padding: 0 4%;
          }

          .navlinks {
            gap: 15px;
          }

          .hero {
            padding-left: 5%;
            padding-right: 5%;
          }

          .hero-inner {
            grid-template-columns: 1fr .8fr;
          }

          .category-list {
            grid-template-columns: repeat(3, 1fr);
          }

          .listing-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .navbar {
            height: auto;
            min-height: 68px;
            flex-wrap: wrap;
            padding: 14px 5%;
          }

          .brand {
            font-size: 22px;
          }

          .navlinks {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
            padding: 10px 0;
          }

          .navlinks.open {
            display: flex;
          }

          .nav-actions {
            gap: 6px;
          }

          .login-btn, .sell-btn, .cart-btn {
            padding: 9px 10px;
            font-size: 11px;
          }

          .hero {
            padding: 50px 6% 45px;
          }

          .hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero h1 {
            font-size: 42px;
            letter-spacing: -1.7px;
          }

          .hero-copy {
            font-size: 14px;
            margin-left: auto;
            margin-right: auto;
          }

          .searchbox {
            margin: auto;
          }

          .searchbox button {
            padding: 0 13px;
          }

          .hero-art {
            min-height: 260px;
          }

          .hero-circle {
            width: 250px;
          }

          .hero-animal {
            font-size: 145px;
          }

          .floating-one {
            left: 2%;
            bottom: 10px;
          }

          .floating-two {
            right: 0;
            top: 10px;
          }

          .section {
            padding: 45px 5%;
          }

          .section-heading h2 {
            font-size: 24px;
          }

          .category-list {
            grid-template-columns: repeat(3, 1fr);
            gap: 9px;
          }

          .category-card {
            padding: 16px 5px;
          }

          .category-icon {
            font-size: 29px;
          }

          .category-card strong {
            font-size: 11px;
          }

          .listing-grid {
            grid-template-columns: 1fr;
          }

          .animal-picture {
            height: 180px;
          }

          .benefits {
            grid-template-columns: 1fr;
          }

          .cta {
            padding: 25px;
            align-items: flex-start;
            flex-direction: column;
          }

          .footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="topbar"></div>

      <header className="navbar">
        <a href="#home" className="brand">
  <img
    src="/livesta-favicon.png"
    alt="LIVESTA"
    className="brand-logo"
  />
  <span>LIVESTA</span>
</a>

        <nav className={`navlinks ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#categories" onClick={() => setMenuOpen(false)}>
            Categories
          </a>

          <a
            href="#marketplace"
            onClick={() => {
              setMenuOpen(false)
              setMarketplaceOpened(true)
            }}
          >
            Marketplace
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="cart-btn"
            onClick={() =>
              setPopupMessage(`You have ${cart.length} item(s) in your cart.`)
            }
          >
            🛒 {cart.length}
          </button>

          <button
            className="login-btn"
            onClick={() => setShowLogin(true)}
          >
            Log in
          </button>

          <button
            className="sell-btn"
            onClick={() => {
              setShowLogin(true)
              setShowSellerDashboard(false)
            }}
          >
            Start selling
          </button>

          <button
            className="cart-btn"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none' }}
          >
            ☰
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-inner">
            <div>
              <div className="eyebrow">
                Your local livestock marketplace
              </div>

              <h1>
                Livestock trading, <span>made simple.</span>
              </h1>

              <p className="hero-copy">
                Discover quality livestock from farmers and trusted sellers
                across Akwa Ibom. Find what you need, all in one place.
              </p>

              <form
                className="searchbox"
                onSubmit={(event) => {
                  event.preventDefault()
                  document.getElementById('marketplace')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
              >
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search goats, cattle, location..."
                  aria-label="Search livestock"
                />

                <button type="submit">Search</button>
              </form>

              <div className="hero-note">
                ✓ Local sellers &nbsp; ✓ Easy browsing &nbsp; ✓ Simple ordering
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-circle">
                <img
                  className="hero-animal"
                  src={goatImage}
                  alt="Goat"
                />
              </div>

              <div className="floating-card floating-one">
                ✓ Local marketplace
                <small>Akwa Ibom, Nigeria</small>
              </div>

              <div className="floating-card floating-two">
                🐄 Livestock
                <small>All in one place</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="categories">
          <div className="section-heading">
            <div>
              <h2>Explore categories</h2>
              <p>Find the livestock you are looking for.</p>
            </div>
          </div>

          <div className="category-list">
            {categories.map((item) => {
              const icons = {
                All: null,
                Goats: goatImage,
                Cattle: cattleImage,
                Sheep: sheepImage,
                Pigs: pigImage,
                Poultry: poultryImage,
                Rabbits: rabbitImage,
              }

              return (
                <button
                  key={item}
                  className={`category-card ${
                    category === item ? 'active' : ''
                  }`}
                  onClick={() => {
                    setCategory(item)
                    document.getElementById('marketplace')?.scrollIntoView({
                      behavior: 'smooth',
                    })
                  }}
                >
                  <span className="category-icon">
                    {icons[item] ? (
                      <img src={icons[item]} alt={item} />
                    ) : (
                      <span>🌿</span>
                    )}
                  </span>

                  <strong>
                    {item === 'All' ? 'All livestock' : item}
                  </strong>
                </button>
              )
            })}
          </div>
        </section>

        <section className="section listing-section" id="marketplace">
          <div className="listing-inner">
            <div className="section-heading">
              <div>
                <h2>Livestock marketplace</h2>
                <p>Browse available livestock from local sellers.</p>
              </div>

              <button
                className="text-link"
                onClick={() => {
                  setCategory('All')
                  setSearch('')
                }}
              >
                Clear filters ↗
              </button>
            </div>

            <div className="listing-grid">
              {filteredLivestock.length > 0 ? (
                filteredLivestock.map((animal) => (
                  <article className="animal-card" key={animal.id}>
                    <div className="animal-picture">
                      {animal.image ? (
                        <img src={animal.image} alt={animal.name} />
                      ) : (
                        <span>{animal.emoji}</span>
                      )}

                      <div className="badge">{animal.badge}</div>
                    </div>

                    <div className="animal-info">
                      <div className="animal-category">
                        {animal.category}
                      </div>

                      <h3>{animal.name}</h3>

                      <p className="animal-description">
                        {animal.description}
                      </p>

                      <div className="animal-location">
                        📍 {animal.location}, Akwa Ibom
                      </div>

                      <div className="animal-bottom">
                        <div className="price">
                          {formatPrice(animal.price)}
                        </div>

                        <button
                          className="add-btn"
                          onClick={() => {
                            if (!marketplaceOpened) {
                              setPopupMessage(
                                'Please open the Marketplace first to add livestock to your cart.'
                              )
                              return
                            }

                            addToCart(animal)
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <h3>No livestock found</h3>
                  <p>
                    Try another search or choose a different category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-heading">
            <div>
              <h2>A simpler way to trade livestock</h2>
              <p>
                Everything you need to get started in one marketplace.
              </p>
            </div>
          </div>

          <div className="benefits">
            <div className="benefit">
              <span className="benefit-icon">🔎</span>
              <h3>Find livestock easily</h3>
              <p>
                Search and browse livestock by category and location.
              </p>
            </div>

            <div className="benefit">
              <span className="benefit-icon">🤝</span>
              <h3>Connect with sellers</h3>
              <p>
                Discover livestock offered by farmers and local traders.
              </p>
            </div>

            <div className="benefit">
              <span className="benefit-icon">🛒</span>
              <h3>Simple ordering</h3>
              <p>
                Keep track of the livestock you want to purchase.
              </p>
            </div>
          </div>

          <div className="cta" style={{ marginTop: 35 }}>
            <div>
              <h2>Are you a livestock seller?</h2>
              <p>
                Showcase your livestock and reach more buyers.
              </p>
            </div>

            <button
              onClick={() => {
                setShowLogin(true)
                setShowSellerDashboard(false)
              }}
            >
              Become a seller →
            </button>
          </div>
        </section>
      </main>

      {popupMessage && (
        <div
          role="presentation"
          onClick={() => setPopupMessage('')}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: 'rgba(10, 25, 16, 0.58)',
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="livesta-popup-title"
            aria-describedby="livesta-popup-message"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(420px, 100%)',
              padding: 28,
              borderRadius: 16,
              background: '#fff',
              color: '#203b2a',
              boxShadow: '0 20px 60px rgba(0,0,0,.24)',
              textAlign: 'center',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                margin: '0 auto 14px',
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                background: '#eaf4e9',
                color: '#1d7047',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              L
            </div>

            <h2
              id="livesta-popup-title"
              style={{ margin: '0 0 10px', fontSize: 21 }}
            >
              LIVESTA
            </h2>

            <p
              id="livesta-popup-message"
              style={{
                margin: '0 0 22px',
                color: '#657368',
                lineHeight: 1.6,
              }}
            >
              {popupMessage}
            </p>

            <button
              type="button"
              onClick={() => setPopupMessage('')}
              autoFocus
              style={{
                width: '100%',
                border: 0,
                borderRadius: 9,
                padding: '12px 18px',
                background: '#1d7047',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Okay
            </button>
          </section>
        </div>
      )}

      <footer className="footer">
  <div className="footer-inner">

    <div className="footer-brand">
      <a
  href="#home"
  className="brand"
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
  <img
    src="/livesta-favicon.png"
    alt="LIVESTA"
    className="brand-logo"
  />
  <span>LIVESTA</span>
</a>

      <p className="footer-tagline">
        Livestock trading, made simple.
      </p>

      <p className="footer-description">
        Discover livestock, connect with sellers, and trade with
        confidence through one simple marketplace.
      </p>

      <div className="footer-trust">
        ✓ Built for farmers, traders and buyers
      </div>
    </div>

    <div className="footer-column">
      <h3>Marketplace</h3>

      <a href="#home">Home</a>

      <a href="#categories">Categories</a>

      <a
        href="#marketplace"
        onClick={() => setMarketplaceOpened(true)}
      >
        Browse Livestock
      </a>

      <a href="#about">How LIVESTA Works</a>
    </div>

    <div className="footer-column">
      <h3>For Sellers</h3>

      <button
        type="button"
        onClick={() => {
          setShowLogin(true)
          setShowSellerDashboard(false)
        }}
      >
        Seller Dashboard
      </button>

      <button
        type="button"
        onClick={() => {
          setShowLogin(true)
          setShowSellerDashboard(false)
        }}
      >
        Start Selling
      </button>

      <a href="#about">Seller Benefits</a>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'Seller registration and livestock listing tools are available after you log in as a seller.'
          )
        }
      >
        Seller Guide
      </button>
    </div>

    <div className="footer-column">
      <h3>Support</h3>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'Need help with LIVESTA? Please contact the LIVESTA support team.'
          )
        }
      >
        Help Center
      </button>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'For support, please contact the LIVESTA team through the contact details provided by the marketplace administrator.'
          )
        }
      >
        Contact Us
      </button>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'Frequently asked questions will be available here soon.'
          )
        }
      >
        FAQs
      </button>
    </div>

    <div className="footer-column">
      <h3>Company</h3>

      <a href="#about">About LIVESTA</a>

      <a href="#about">How It Works</a>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'LIVESTA is a livestock marketplace designed to make buying and selling livestock simpler.'
          )
        }
      >
        Our Mission
      </button>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'Privacy information will be published here as the LIVESTA platform grows.'
          )
        }
      >
        Privacy Policy
      </button>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'LIVESTA terms of service will be published here before launch.'
          )
        }
      >
        Terms of Service
      </button>
    </div>

  </div>

  <div className="footer-bottom">
    <div>
      © 2026 LIVESTA. Built for Akwa Ibom, Nigeria.
    </div>

    <div className="footer-bottom-links">
      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'LIVESTA refund and cancellation information will be published here.'
          )
        }
      >
        Refund Policy
      </button>

      <button
        type="button"
        onClick={() =>
          setPopupMessage(
            'More legal information will be available here soon.'
          )
        }
      >
        Legal
      </button>
    </div>
  </div>
</footer>
    </div>
  )
}

export default App