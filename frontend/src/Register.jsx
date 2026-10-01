import { useState } from 'react';

export default function Register({
  onHome,
  onRegistered,
  initialRole = 'buyer',
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showPopup = (title, message, type = 'success') => {
    setPopup({ open: true, title, message, type });
  };

  const closePopup = () => {
    const wasSuccessful = popup.type === 'success';

    setPopup((current) => ({ ...current, open: false }));

    if (wasSuccessful) {
      onRegistered();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://livesta-t0yd.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Registration failed'
        );
      }

      showPopup(
        'Account created!',
        'Your LIVESTA account has been created successfully. Click OK to continue.',
        'success'
      );
    } catch (err) {
      showPopup(
        'Registration failed',
        err.message || 'Unable to connect to the server.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d8e1da',
    borderRadius: '7px',
    marginBottom: '18px',
    boxSizing: 'border-box',
    fontSize: '15px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '7px',
    color: '#263b30',
  };

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
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '35px',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ color: '#174a32', marginBottom: '8px' }}>
          LIVESTA
        </h1>

        <p style={{ color: '#718078', marginBottom: '25px' }}>
          Create your account
        </p>

        <label style={labelStyle}>Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Account type</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            background: loading ? '#8aa997' : '#1d7047',
            color: 'white',
            border: 0,
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={onHome}
          style={{
            width: '100%',
            marginTop: '15px',
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

      {popup.open && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 35, 25, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'livestaFadeIn 0.2s ease',
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="livesta-popup-title"
            aria-describedby="livesta-popup-message"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
              animation: 'livestaPopupIn 0.25s ease',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background:
                  popup.type === 'error' ? '#fdebea' : '#e5f4e9',
                color:
                  popup.type === 'error' ? '#c0392b' : '#1d7047',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                fontSize: '27px',
                fontWeight: 'bold',
              }}
            >
              {popup.type === 'error' ? '!' : '✓'}
            </div>

            <h2
              id="livesta-popup-title"
              style={{
                color: '#174a32',
                fontSize: '22px',
                margin: '0 0 10px',
              }}
            >
              {popup.title}
            </h2>

            <p
              id="livesta-popup-message"
              style={{
                color: '#64746a',
                fontSize: '15px',
                lineHeight: 1.6,
                margin: '0 0 24px',
              }}
            >
              {popup.message}
            </p>

            <button
              type="button"
              onClick={closePopup}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                background: '#1d7047',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes livestaFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes livestaPopupIn {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}