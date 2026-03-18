import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiLogIn,
  FiArrowRight,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="auth-pattern"></div>
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className="auth-header" variants={fadeInUp}>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your luxury experience</p>
          </motion.div>

          <AnimatePresence>
            {loginError && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiAlertCircle />
                <span>{loginError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div className="form-group" variants={fadeInUp}>
              <label htmlFor="email">
                <FiMail className="field-icon" />
                Email Address
              </label>
              <div className={`input-wrapper ${errors.email && touched.email ? 'error' : ''}`}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.email && touched.email && (
                  <motion.span 
                    className="field-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="form-group" variants={fadeInUp}>
              <label htmlFor="password">
                <FiLock className="field-icon" />
                Password
              </label>
              <div className={`input-wrapper ${errors.password && touched.password ? 'error' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && touched.password && (
                  <motion.span 
                    className="field-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="forgot-password" variants={fadeInUp}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </motion.div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-large auth-submit"
              disabled={isLoading}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <FiLogIn />
                  Sign In
                </>
              )}
            </motion.button>

            <motion.div className="auth-footer" variants={fadeInUp}>
              <p>Don't have an account?</p>
              <Link to="/register" className="auth-link">
                Create Account <FiArrowRight />
              </Link>
            </motion.div>
          </form>

          <motion.div className="social-login" variants={fadeInUp}>
            <div className="divider">
              <span>Or continue with</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn google">
                <img src="https://www.google.com/favicon.ico" alt="Google" />
                Google
              </button>
              <button className="social-btn facebook">
                <img src="https://www.facebook.com/favicon.ico" alt="Facebook" />
                Facebook
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Login;