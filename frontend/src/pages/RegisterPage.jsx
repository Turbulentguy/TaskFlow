import { useState } from 'react'
import { registerUser } from '../services/authservice.js'

import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg'
import '../pages/LoginPage.css'
import '../pages/RegisterPage.css'
import LoginPage from '../pages/LoginPage'

function RegisterPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  if (isLogin) {
    return <LoginPage />
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.passwordConfirmation) {
      alert("Password mismatch.");
      return;
    }

    try {
      const data = await registerUser(form);
      console.log(data);
      alert('Registration Successful');
      setIsLogin(true)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='login-background'>
      <div className='login-container'>
        <p className='brand'>
          Jiraiya
        </p>
        <img src={logo} alt="Jiraiya" className='logo' />
        <p className='registration-text'>
          Registration Form
        </p>
        <form className='login-form' onSubmit={handleSubmit}>
          <input name='name' value={form.name} onChange={handleChange} className='name' type='text' placeholder='Name' required/>
          <input name='email' value={form.email} onChange={handleChange} className='email' type="email" placeholder='Email' required/>
          <input name='password' value={form.password} onChange={handleChange} className='password' type="password" placeholder='Password' required/>
          <input name='passwordConfirmation' value={form.passwordConfirmation} onChange={handleChange} className='password-confirmation' type='password' placeholder='Password Confirmation' required/>
          <button type="submit">Sign Up</button>
        </form>
        <p className='sign-up-message'>Already have an account? <button 
                type='button' 
                className='sign-up-link'
                onClick={() => {setIsLogin(true)}}
              >
              Sign In
            </button>
          </p>
      </div>
    </div>
  )
}

export default RegisterPage