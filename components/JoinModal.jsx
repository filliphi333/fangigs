'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import SignInModal from './SignInModal';

export default function JoinModal({ isOpen, onClose }) {
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [userType, setUserType] = useState('talent');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    agreeToTerms: false
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        company: '',
        agreeToTerms: false
      });
      setErrors({});
      setSuccessMessage('');
      setPasswordStrength({ score: 0, text: '', color: '' });
    }
  }, [isOpen]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let text = '';
    let color = '';

    if (password.length === 0) {
      return { score: 0, text: '', color: '' };
    }

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        text = 'Very Weak';
        color = 'text-red-500';
        break;
      case 2:
        text = 'Weak';
        color = 'text-orange-500';
        break;
      case 3:
        text = 'Fair';
        color = 'text-yellow-500';
        break;
      case 4:
        text = 'Good';
        color = 'text-blue-500';
        break;
      case 5:
        text = 'Strong';
        color = 'text-green-500';
        break;
      default:
        text = '';
        color = '';
    }

    return { score, text, color };
  };

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (formData.password) { // Use formData.password to get the current value for validation
          if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
          } else if (passwordStrength.score < 3) {
            newErrors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and symbols';
          } else {
            delete newErrors.password;
          }
        }
        // Check confirm password if it exists
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'phone':
        if (userType === 'creator' && value) { // Check if value is present for creators
          const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            newErrors.phone = 'Please enter a valid phone number';
          } else {
            delete newErrors.phone;
          }
        } else if (userType === 'creator' && !value) { // Allow empty phone for creators
          delete newErrors.phone;
        }
        break;

      case 'agreeToTerms':
        if (!value) {
          newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        } else {
          delete newErrors.agreeToTerms;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation
    validateField(name, newValue);

    // Password strength check
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength.score < 3) {
        newErrors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and symbols';
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation for creators
    if (userType === 'creator' && formData.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialSignUp = async (provider) => {
    setIsLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
    }
    // Note: OAuth will redirect to the provider, so we don't need to handle success here
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' });
        } else {
          setErrors({ general: authError.message });
        }
        return;
      }

      const user = data?.user;
      if (!user) {
        setErrors({ general: 'Signup succeeded, but no user was returned. Check email confirmation.' });
        return;
      }

      // Check if email confirmation is required
      const isEmailConfirmationRequired = !data.session && user.email_confirmed_at === null;

      // Create profile
      const profilePayload = {
        id: user.id,
        full_name: formData.fullName.trim(),
        email: user.email,
        type: userType,
        phone: formData.phone || null,
        company: formData.company || null,
        created_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload);

      if (profileError) {
        console.error("Profile creation failed:", profileError);
        setErrors({ general: 'Could not create profile. Please try again.' });
        return;
      }

      localStorage.setItem("user_type", userType);

      // Show tailored success message based on email confirmation requirement
      if (isEmailConfirmationRequired) {
        setSuccessMessage(`✅ Account created successfully! Please check your email (${user.email}) and click the confirmation link to complete your registration. Once confirmed, you can sign in and complete your profile.`);

        // Don't redirect automatically for email confirmation cases
        setTimeout(() => {
          onClose();
        }, 5000); // Give more time to read the message
      } else {
        setSuccessMessage('Account created successfully! Redirecting to profile setup...');

        // Redirect after a short delay to show success message
        setTimeout(() => {
          window.location.href = "/edit-profile";
          onClose();
        }, 1500);
      }

    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full relative flex overflow-hidden animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Neon Sign */}
        <div className="w-1/2 hidden lg:block relative">
          <Image
            src="/images/neon-sign.jpg"
            alt="Neon Sign"
            width={600}
            height={700}
            className="object-cover h-full w-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 relative overflow-y-auto max-h-screen">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join FanGigs</h2>
            <p className="text-gray-600">Create your account and start connecting</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Type Switcher */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  userType === 'talent'
                    ? 'bg-[#E8967B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setUserType('talent')}
                disabled={isLoading}
              >
                Talent
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  userType === 'creator'
                    ? 'bg-[#E8967B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setUserType('creator')}
                disabled={isLoading}
              >
                Creator/Producer
              </button>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="mb-6">
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocialSignUp('google')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={isLoading}
              >
                <img src="/images/google.png" alt="Google" className="w-5 h-5 mr-3" />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignUp('facebook')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={isLoading}
              >
                <img src="/images/facebook.webp" alt="Facebook" className="w-5 h-5 mr-3" />
                Continue with Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignUp('twitter')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#1DA1F2] text-sm font-medium text-white hover:bg-[#1A91DA] disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Continue with Twitter
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSignUp} noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={isLoading}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a secure password"
                  disabled={isLoading}
                  aria-describedby={errors.password ? "password-error" : "password-help"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.636 6.636m0 0l-2.122-2.121M6.636 6.636L12 12.001m7.364-7.365l-2.122 2.122M19.5 12.001l-2.878 2.879" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordStrength.text && (
                <div className="mt-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score <= 2 ? 'bg-orange-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!errors.password && (
                <p id="password-help" className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with mix of letters, numbers & symbols
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Creator-specific fields */}
            {userType === 'creator' && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8967B] focus:border-transparent transition-colors"
                    placeholder="Your company name (optional)"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`mt-1 h-4 w-4 rounded border-gray-300 text-[#E8967B] focus:ring-[#E8967B] focus:ring-offset-0 ${
                  errors.agreeToTerms ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
                aria-describedby={errors.agreeToTerms ? "terms-error" : undefined}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms" className="text-[#E8967B] hover:underline" target="_blank">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#E8967B] hover:underline" target="_blank">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p id="terms-error" className="text-sm text-red-600">{errors.agreeToTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms || formData.password !== formData.confirmPassword || Object.keys(errors).length > 0}
              className="w-full bg-[#E8967B] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => {
                onClose();
                setSignInModalOpen(true);
              }}
              className="text-[#E8967B] hover:underline font-medium"
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
        openJoinModal={() => {
          setSignInModalOpen(false);
          // Don't need to call onClose() here since we want to reopen this modal
        }}
      />
    </div>
  );
}