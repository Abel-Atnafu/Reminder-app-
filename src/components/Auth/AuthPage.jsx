import { useState } from 'react';
import styles from './AuthPage.module.css';

export function AuthPage({ onSignIn, onSignUp, loading, error }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpDone, setSignUpDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      const ok = await onSignUp(email, password);
      if (ok) setSignUpDone(true);
    } else {
      await onSignIn(email, password);
    }
  };

  if (signUpDone) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <span className={styles.logo}>📋</span>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <button className={styles.switchBtn} onClick={() => { setSignUpDone(false); setMode('signin'); }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.logo}>📋</span>
        <h1 className={styles.title}>RemindMe</h1>
        <p className={styles.subtitle}>
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            className={styles.switchBtn}
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
