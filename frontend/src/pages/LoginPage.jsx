import { useState, useEffect } from 'react';
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';

import '../pages/LoginPage.css';

import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashBoardPage.jsx';
import { loginUser, restoreSession } from '../services/authservice.js';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [isDashboard, setIsDashBoard] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = await loginUser(form);

      setUser({
        ...data.user,
        access_token: data.access_token
      });

      setIsDashBoard(true);

    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const restoredUser = await restoreSession();

        if (restoredUser) {
          setUser(restoredUser);
          setIsDashBoard(true);
        }
      } catch (error) {
        alert(error.message);
      } finally {
        setIsCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  if (isCheckingSession) {
    return <p>Checking session...</p>;
  }

  if (isRegister) {
    return <RegisterPage />
  }

  if (isDashboard) {
    return <DashboardPage user={user} setUser={setUser}/>
  }

  return (
    <div className='login-background'>
      <div className='login-container'>
        <p className='brand'>
          Jiraiya
        </p>
        <img src={logo} alt="Jiraiya Logo" className='logo'/>
        <p className='welcome-message'>
          Welcome Back!
        </p>
        <form className='login-form' onSubmit={handleSubmit}>
          <input name='email' value={form.email} type="email" onChange={handleChange} placeholder='Email' required/>
          <input name='password' value={form.password} type="password" onChange={handleChange} placeholder='Password' required/>
          <button type='submit'>Sign in</button>
        </form>
        <p className='sign-up-message'>
          Don't have an account? <button
            type='button'
            className='sign-up-link'
            onClick={() => {setIsRegister(true)}}
          >
            Sign Up
          </button>
        </p>
        </div>
      </div>
  )
}

export default LoginPage
