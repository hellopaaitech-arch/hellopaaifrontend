import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';
import { LogoUpload } from '../../components/LogoUpload.jsx';

export function UserRegister() {
  const nav = useNavigate();
  const location = useLocation();
  const [clientCode, setClientCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gowthra, setGowthra] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);

  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpMethod, setMobileOtpMethod] = useState('sms'); // 'sms' or 'whatsapp'
  const [emailVerifiedToken, setEmailVerifiedToken] = useState(null);
  const [mobileVerifiedToken, setMobileVerifiedToken] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (state?.email) setEmail(state.email);
    if (state?.emailVerifiedToken) setEmailVerifiedToken(state.emailVerifiedToken);
  }, [location.state]);

  const [devEmailOtp, setDevEmailOtp] = useState(null);
  const [devMobileOtp, setDevMobileOtp] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function requestOtp(type) {
    setError(null);
    try {
      const payload = type === 'email' 
        ? { type, email: email.trim().toLowerCase() } 
        : { type, mobile: mobile.trim(), method: mobileOtpMethod };
      const r = await api.post('/otp/request', payload);
      if (type === 'email') setDevEmailOtp(r.data.devOtp || null);
      if (type === 'mobile') setDevMobileOtp(r.data.devOtp || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    }
  }

  async function verifyOtp(type) {
    setError(null);
    if (type === 'email' && !email) {
      setError('Email is required');
      return;
    }
    if (type === 'mobile' && !mobile) {
      setError('Mobile number is required');
      return;
    }
    // Validate mobile is numeric (not an email)
    if (type === 'mobile' && /@/.test(mobile)) {
      setError('Please enter a mobile number, not an email address');
      return;
    }
    const otp = type === 'email' ? emailOtp.trim() : mobileOtp.trim();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP (must be at least 4 digits)');
      return;
    }
    // Validate OTP is numeric (for both email and mobile)
    if (!/^\d+$/.test(otp)) {
      setError('OTP must contain only numbers');
      return;
    }
    try {
      const payload =
        type === 'email' 
          ? { type, email: email.trim().toLowerCase(), otp } 
          : { type, mobile: mobile.trim(), otp };
      console.log('[Frontend] Verifying OTP:', { type, payload });
      const r = await api.post('/otp/verify', payload);
      if (type === 'email') setEmailVerifiedToken(r.data.verifiedToken);
      if (type === 'mobile') setMobileVerifiedToken(r.data.verifiedToken);
    } catch (err) {
      console.error('[Frontend] OTP verification error:', err?.response?.data);
      setError(err?.response?.data?.message || 'OTP verification failed');
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/auth/user/register', {
        clientCode,
        name,
        email,
        mobile,
        password,
        emailVerifiedToken,
        mobileVerifiedToken,
        dob: dob || undefined,
        timeOfBirth: timeOfBirth || undefined,
        placeOfBirth: placeOfBirth || undefined,
        gowthra: gowthra || undefined,
        nativeLanguage: nativeLanguage || undefined,
        logoUrl
      });
      nav('/user/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  const emailDone = !!emailVerifiedToken;
  const mobileDone = !!mobileVerifiedToken;

  return (
    <div className="page center">
      <form className="card wide" onSubmit={onRegister}>
        <div className="h">User Registration</div>
        <div className="muted">
          {emailDone ? 'Mobile OTP required.' : 'Email + Mobile OTP required.'}
        </div>

        <div className="grid2">
          <label className="field">
            <div className="label">Client ID</div>
            <input
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              placeholder="CLI-ABC123"
              required
            />
          </label>
          <label className="field">
            <div className="label">Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </label>
        </div>

        <label className="field">
          <div className="label">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            readOnly={!!location.state?.emailVerifiedToken}
          />
          {emailDone && location.state?.emailVerifiedToken ? (
            <div className="muted small">Email verified via sign-in</div>
          ) : null}
        </label>

        {!emailDone ? (
          <>
            <div className="row">
              <button className="btn ghost" type="button" onClick={() => requestOtp('email')} disabled={!email}>
                Send Email OTP
              </button>
              {devEmailOtp ? <div className="pill">dev OTP: {devEmailOtp}</div> : null}
            </div>
            <div className="grid2">
              <label className="field">
                <div className="label">Email OTP</div>
                <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="6 digits" />
              </label>
              <button className="btn" type="button" onClick={() => verifyOtp('email')} disabled={!emailOtp}>
                Verify Email OTP
              </button>
            </div>
          </>
        ) : null}

        <label className="field">
          <div className="label">Mobile</div>
          <input 
            value={mobile} 
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d+()-]/g, ''); // Only allow digits and phone chars
              setMobile(value);
            }} 
            placeholder="Mobile number (digits only)" 
            type="tel"
            required 
          />
        </label>

        <label className="field">
          <div className="label">OTP Delivery Method</div>
          <div className="row" style={{ gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="mobileOtpMethod"
                value="sms"
                checked={mobileOtpMethod === 'sms'}
                onChange={(e) => setMobileOtpMethod(e.target.value)}
                disabled={mobileDone}
              />
              <span>SMS</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="mobileOtpMethod"
                value="whatsapp"
                checked={mobileOtpMethod === 'whatsapp'}
                onChange={(e) => setMobileOtpMethod(e.target.value)}
                disabled={mobileDone}
              />
              <span>WhatsApp</span>
            </label>
          </div>
        </label>

        <div className="row">
          <button className="btn ghost" type="button" onClick={() => requestOtp('mobile')} disabled={!mobile || mobileDone}>
            Send Mobile OTP ({mobileOtpMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'})
          </button>
          {devMobileOtp ? <div className="pill">dev OTP: {devMobileOtp}</div> : null}
        </div>

        <div className="grid2">
          <label className="field">
            <div className="label">Mobile OTP</div>
            <input value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value)} placeholder="6 digits" />
          </label>
          <button className="btn" type="button" onClick={() => verifyOtp('mobile')} disabled={mobileDone || !mobileOtp}>
            {mobileDone ? 'Mobile Verified' : 'Verify Mobile OTP'}
          </button>
        </div>

        <label className="field">
          <div className="label">Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        <div className="grid2">
          <label className="field">
            <div className="label">Date of Birth</div>
            <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
          </label>
          <label className="field">
            <div className="label">Time of Birth</div>
            <input value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} placeholder="HH:MM AM/PM" />
          </label>
        </div>
        <div className="grid2">
          <label className="field">
            <div className="label">Place of Birth</div>
            <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="City" />
          </label>
          <label className="field">
            <div className="label">Gowthra</div>
            <input value={gowthra} onChange={(e) => setGowthra(e.target.value)} placeholder="e.g. Kashyapa" />
          </label>
        </div>
        <label className="field">
          <div className="label">Native Language</div>
          <input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="e.g. Telugu, Hindi" />
        </label>

        <label className="field">
          <div className="label">Profile Image (Optional)</div>
          <LogoUpload value={logoUrl} onChange={setLogoUrl} folder="users" />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <button className="btn" disabled={busy || !emailDone || !mobileDone}>
          {busy ? 'Creating…' : 'Create Account'}
        </button>

        <div className="muted small">
          <Link to="/user/login">Login</Link> · <Link to="/">Back</Link>
        </div>
      </form>
    </div>
  );
}

