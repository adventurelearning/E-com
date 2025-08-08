// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../Services/Api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await Api.post('adminUsers/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data.user));
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      console.log("Setting expiry to:", new Date(expiry).toLocaleString());
      localStorage.setItem("token_expiry", expiry);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Portal</h2>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            style={isLoading ? styles.disabledButton : styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7ff',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(138, 79, 255, 0.15)',
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    color: '#5c2d91',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  logo: {
    margin: '0 auto 15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#555',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#8A4FFF',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
  disabledButton: {
    backgroundColor: '#b19cd9',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '10px',
  },
};

// Add focus styles dynamically
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  // style.innerHTML = `
  //   input:focus {
  //     border-color: #8A4FFF !important;
  //     box-shadow: 0 0 0 3px rgba(138, 79, 255, 0.2) !important;
  //     outline: none;
  //   }
  //   button:hover {
  //     background-color: #7a3ad9 !important;
  //     transform: translateY(-2px);
  //   }
  // `;
  document.head.appendChild(style);
});

export default AdminLogin;