import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiUserPlus,
  FiArrowRight,
  FiAlertCircle,
  FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // Validation rules
  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        setPasswordStrength(checkPasswordStrength(value));
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allValues.password) return 'Passwords do not match';
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
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    if (touched[name]) {
      const error = validateField(name, value, { ...formData, [name]: value });
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
    setRegisterError('');

    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await register(formData.name, formData.email, formData.password);
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setRegisterError(
        error.response?.data?.message || 
        'Registration failed. Email may already be in use.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#ff4444';
    if (passwordStrength < 50) return '#ff8800';
    if (passwordStrength < 75) return '#ffd700';
    if (passwordStrength < 100) return '#00c851';
    return '#00c851';
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
      {/* Background Pattern */}
      <div className="auth-pattern"></div>

      <div className="auth-container">
        <motion.div 
          className="auth-card register-card"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div className="auth-header" variants={fadeInUp}>
            <h1>Create Account</h1>
            <p>Join Kings Luxury for an exceptional experience</p>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {registerError && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiAlertCircle />
                <span>{registerError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name Field */}
            <motion.div className="form-group" variants={fadeInUp}>
              <label htmlFor="name">
                <FiUser className="field-icon" />
                Full Name
              </label>
              <div className={`input-wrapper ${errors.name && touched.name ? 'error' : ''}`}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              <AnimatePresence>
                {errors.name && touched.name && (
                  <motion.span 
                    className="field-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email Field */}
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

            {/* Password Field */}
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
                  placeholder="Create a password"
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

              {/* Password Strength Meter */}
              {formData.password && (
                <motion.div 
                  className="password-strength"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-label" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthLabel()}
                  </span>
                </motion.div>
              )}

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

            {/* Confirm Password Field */}
            <motion.div className="form-group" variants={fadeInUp}>
              <label htmlFor="confirmPassword">
                <FiShield className="field-icon" />
                Confirm Password
              </label>
              <div className={`input-wrapper ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && touched.confirmPassword && (
                  <motion.span 
                    className="field-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.confirmPassword}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div className="form-group terms-group" variants={fadeInUp}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  I accept the <Link to="/terms">Terms of Service</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
              <AnimatePresence>
                {errors.terms && !acceptedTerms && (
                  <motion.span 
                    className="field-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.terms}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
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
                  <FiUserPlus />
                  Create Account
                </>
              )}
            </motion.button>

            {/* Login Link */}
            <motion.div className="auth-footer" variants={fadeInUp}>
              <p>Already have an account?</p>
              <Link to="/login" className="auth-link">
                Sign In <FiArrowRight />
              </Link>
            </motion.div>
          </form>

          {/* Social Register (Optional) */}
          <motion.div className="social-login" variants={fadeInUp}>
            <div className="divider">
              <span>Or sign up with</span>
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

export default Register;