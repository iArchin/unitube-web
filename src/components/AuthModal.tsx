"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

type AuthView = "login" | "signup" | "forgot-password";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "https://api.unitribe.app/ut/api/login",
        {
          email: loginEmail,
          password: loginPassword,
        }
      );
      
      // Login successful - store user and token in Redux
      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
      
      setIsLoading(false);
      // Reset form
      setLoginEmail("");
      setLoginPassword("");
      // Close modal after successful login
      onOpenChange(false);
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle error response
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join(", ");
          setError(errorMessages);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError("Login failed. Please check your credentials and try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "https://api.unitribe.app/ut/api/register",
        {
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          password_confirmation: signupConfirmPassword,
        }
      );
      
      // Registration successful - store user and token in Redux
      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
      
      setIsLoading(false);
      // Reset form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      // Close modal after successful registration
      onOpenChange(false);
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle error response
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join(", ");
          setError(errorMessages);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual forgot password logic
    console.log("Forgot password:", { email: forgotEmail });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset email sent!");
      setForgotEmail("");
      setView("login");
    }, 1000);
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    console.log("Google authentication");
  };

  const resetAndClose = () => {
    setView("login");
    setError(null);
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setForgotEmail("");
    onOpenChange(false);
  };

  const switchToSignup = () => {
    setError(null);
    setView("signup");
  };

  const switchToLogin = () => {
    setError(null);
    setView("login");
  };

  const switchToForgotPassword = () => {
    setError(null);
    setView("forgot-password");
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {view === "login" && "Welcome Back"}
            {view === "signup" && "Create Account"}
            {view === "forgot-password" && "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        {view === "login" && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={switchToForgotPassword}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full border-[#333] bg-[#111111] text-white hover:bg-[#222]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={switchToSignup}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        )}

        {view === "signup" && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-name" className="text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full border-[#333] bg-[#111111] text-white hover:bg-[#222]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button
                onClick={switchToLogin}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {view === "forgot-password" && (
          <div className="space-y-4">
            <button
              onClick={switchToLogin}
              className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </button>

            <p className="text-sm text-gray-400 text-center mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="pl-10 bg-[#111111] border-[#333] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

