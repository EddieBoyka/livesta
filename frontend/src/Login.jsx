import { useState } from 'react';

export default function Login({
  onHome,
  onLoginSuccess,
  initialRole = 'buyer',
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
    setPopup((current) => ({ ...current, open: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const response = await fetch(
          'http://https://livesta-t0yd.onrender.com/auth/forgot-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message || 'Unable to process your request.'
          );
        }

        setIsForgotPassword(false);

        showPopup(
          'Check your email',
          'If an account exists with that email address, you will receive instructions to reset your password.',
          'success'
        );

        return;
      }

      const endpoint = isRegistering
        ? 'http://https://livesta-t0yd.onrender.com/auth/register'
        : 'http://https://livesta-t0yd.onrender.com/auth/login';

      const body = isRegistering
        ? { fullName, email, password, role }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Something went wrong.'
        );
      }

      if (isRegistering) {
        setIsRegistering(false);
        setPassword('');

        showPopup(
          'Account created!',
          'Your LIVESTA account has been created successfully. You can now log in.',
          'success'
        );
      } else {
        localStorage.setItem('livestaToken', data.accessToken);
        localStorage.setItem(
          'livestaUser',
          JSON.stringify(data.user)
        );

        onLoginSuccess(data.user);
      }
    } catch (err) {
      showPopup(
        'Something went wrong',
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

  const switchMode = (mode) => {
    setIsRegistering(mode === 'register');
    setIsForgotPassword(mode === 'forgot');
    setPassword('');
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
        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  }}
>
  <img
    src="/livesta-favicon.png"
    alt="LIVESTA"
    style={{
      width: '42px',
      height: '42px',
      objectFit: 'cover',
      borderRadius: '10px',
    }}
  />

  <h1
    style={{
      color: '#174a32',
      margin: 0,
    }}
  >
    LIVESTA
  </h1>
</div>
        <p style={{ color: '#718078', marginBottom: '25px' }}>
          {isForgotPassword
            ? 'Reset your password'
            : isRegistering
              ? 'Create your LIVESTA account'
              : 'Log in to your account'}
        </p>

        {isRegistering && (
          <>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Account type</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              style={inputStyle}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </>
        )}

        <label style={labelStyle}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
        />

        {!isForgotPassword && (
          <>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
              style={inputStyle}
            />

            {!isRegistering && (
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '-10px',
                  marginBottom: '18px',
                }}
              >
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    border: 0,
                    background: 'none',
                    color: '#1d7047',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: '4px 0',
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </>
        )}

        {isForgotPassword && (
          <p
            style={{
              color: '#718078',
              fontSize: '14px',
              lineHeight: 1.5,
              marginTop: '-5px',
              marginBottom: '20px',
            }}
          >
            Enter the email address associated with your account.
            If an account exists, we'll send you instructions to
            reset your password.
          </p>
        )}

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
          {loading
            ? 'Please wait...'
            : isForgotPassword
              ? 'Send reset instructions'
              : isRegistering
                ? 'Create account'
                : 'Log in'}
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '18px',
            color: '#718078',
          }}
        >
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                border: 0,
                background: 'none',
                color: '#1d7047',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ← Back to Log in
            </button>
          ) : (
            <>
              {isRegistering
                ? 'Already have an account? '
                : "Don't have an account? "}
              <button
                type="button"
                onClick={() =>
                  switchMode(isRegistering ? 'login' : 'register')
                }
                style={{
                  border: 0,
                  background: 'none',
                  color: '#1d7047',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {isRegistering ? 'Log in' : 'Register'}
              </button>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={onHome}
          style={{
            width: '100%',
            marginTop: '8px',
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