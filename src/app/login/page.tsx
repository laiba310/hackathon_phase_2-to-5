// frontend/src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api";
import logo from "../../images/todo.jpg";
import { Eye, EyeOff, Lock, Mail, Zap } from 'lucide-react';

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      const { access_token } = response.data;
      login(access_token);
    } catch (err: any) {
      console.error("Email sign-in error:", err);
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900 relative overflow-hidden">
      {/* Cool Lines Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-blue-900"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(6, 182, 212, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(6, 182, 212, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
        }}></div>
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(6, 182, 212, 0.05) 50%, transparent 50%)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Left side - Cool Dark Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-50 rounded-full"></div>
            <Image
              src={logo}
              alt="Todo App Logo"
              width={140}
              height={140}
              className="relative object-contain drop-shadow-2xl"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-gradient-cyan tracking-tight">
              Forge Flow
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <div className="h-px w-12 bg-cyan-400"></div>
              <Zap className="w-5 h-5" />
              <div className="h-px w-12 bg-cyan-400"></div>
            </div>
            <p className="text-xl text-gray-300 font-medium max-w-md">
              Where productivity meets precision in the cool dark
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-800 border-b-2 border-cyan-400 p-6">
        <div className="flex items-center justify-center gap-4">
          <Image src={logo} alt="Logo" width={50} height={50} className="object-contain" />
          <h1 className="text-3xl font-black text-gradient-cyan">TASK FORGE</h1>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-400 rounded-lg p-4 text-red-300 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border-2 border-gray-600 pl-12 pr-4 py-4 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-0 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border-2 border-gray-600 pl-12 pr-12 py-4 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-0 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold px-6 py-4 rounded-lg transition-all transform ${
                isLoading
                  ? 'bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-600">
            <p className="text-gray-400">
              New to Forge Flow?{' '}
              <a
                href="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline underline-offset-4"
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}