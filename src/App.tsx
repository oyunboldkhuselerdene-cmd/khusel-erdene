/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Menu, 
  X, 
  ArrowLeft,
  ArrowRight,
  Music,
  Play,
  Pause
} from 'lucide-react';

type TabType = 'home' | 'game' | 'aboutme' | 'address';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [audioSrc, setAudioSrc] = useState('/api/music-proxy?url=https://cdn1.suno.ai/cGzovQEKSJztgbBI.mp3');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play control guard for background video (always muted to prevent blocking)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Safe fallback if browser blocks auto-play
      });
    }
  }, [videoLoaded]);

  // Fallback handler if current audio source fails to load
  const handleAudioError = () => {
    console.warn("Audio failed to load from current source: " + audioSrc);
    let nextSrc = "";
    if (audioSrc.includes("cdn1.suno.ai")) {
      nextSrc = "/api/music-proxy?url=https://audiocdn.suno.ai/cGzovQEKSJztgbBI.mp3";
    } else if (audioSrc.includes("audiocdn.suno.ai")) {
      nextSrc = "/api/music-proxy?url=https://cdn2.suno.ai/cGzovQEKSJztgbBI.mp3";
    } else if (audioSrc.includes("cdn2.suno.ai")) {
      nextSrc = "https://assets.mixkit.co/music/preview/mixkit-serene-view-1002.mp3";
    }
    
    if (nextSrc) {
      console.log("Switching to fallback audio source:", nextSrc);
      setAudioSrc(nextSrc);
    }
  };

  // Watch audioSrc changes: if we are not muted, play the new source automatically
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.error("Failed to play new audio source:", err);
      });
    }
  }, [audioSrc]);

  // Auto-play/unmute background music on any user interaction
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsMuted(false);
          })
          .catch((err) => {
            console.log("Autoplay blocked or failed:", err);
          });
      }

      // Successfully playing or attempted, remove interaction listeners
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, []);

  const toggleSound = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (audioRef.current) {
      if (newMutedState) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .catch((e) => {
            console.warn("Play failed, attempting reload...", e);
            audioRef.current?.load();
            audioRef.current?.play().catch((err) => {
              console.error("Audio play failed after reload:", err);
            });
          });
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full text-foreground bg-[#001f30] overflow-hidden select-none font-sans" id="app-root">
      
      {/* Background Video Layer (strictly muted to prevent autoplay blocks) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={true}
        playsInline
        preload="auto"
        onCanPlay={() => setVideoLoaded(true)}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 select-none pointer-events-none"
        style={{ opacity: videoLoaded ? 0.70 : 0.2 }}
      />
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,31,48,0.1)_0%,rgba(0,31,48,0.65)_100%)]" id="vignette" />

      {/* Main Glassmorphic Navigation Bar */}
      <header className="relative z-50 w-full border-b border-white/5 backdrop-blur-[2px]" id="main-header">
        <div className="flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <div className="w-10 h-10" id="logo-placeholder" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10" id="desktop-nav">
            {[
              { id: 'home', label: 'Эхлэл' },
              { id: 'game', label: 'Миний Тоглоом' },
              { id: 'aboutme', label: 'Миний Тухай' },
              { id: 'address', label: 'Миний Хаяг' }
            ].map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => setActiveTab(link.id as TabType)}
                  className={`text-sm tracking-wide cursor-pointer transition-all duration-300 relative py-1 focus:outline-none ${
                    isActive 
                      ? 'text-foreground font-medium' 
                      : 'text-white/60 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Nav Right: Action + Mobile Menu Indicator */}
          <div className="flex items-center space-x-4" id="nav-actions">
            {/* Audio Toggle */}
            <button
              id="audio-toggle-button"
              onClick={toggleSound}
              className="p-2.5 rounded-full border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-foreground cursor-pointer"
              title={isMuted ? "Чимээг ажиллуулах" : "Чимээг хаах"}
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 animate-pulse" />}
            </button>

            {/* CTA button */}
            <button
              id="desktop-cta-begin"
              onClick={() => setActiveTab('game')}
              className="hidden sm:inline-flex liquid-glass rounded-full px-7 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.98] font-medium"
            >
              Аялал эхлүүлэх
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full border border-white/10 hover:bg-white/5 text-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-[85px] left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-8 md:hidden flex flex-col space-y-6 shadow-2xl"
          >
            <div className="flex flex-col space-y-4">
              {[
                { id: 'home', label: 'Эхлэл' },
                { id: 'game', label: 'Миний Тоглоом' },
                { id: 'aboutme', label: 'Миний Тухай' },
                { id: 'address', label: 'Миний Хаяг' }
              ].map((link, idx) => (
                <button
                  key={link.id}
                  id={`mobile-nav-link-${link.id}`}
                  onClick={() => {
                    setActiveTab(link.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-lg py-2 transition-all cursor-pointer ${
                    activeTab === link.id 
                      ? 'text-foreground font-medium pl-2 border-l-2 border-white' 
                      : 'text-white/60 hover:text-foreground'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <button
              id="mobile-cta-begin"
              onClick={() => {
                setActiveTab('game');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-4 liquid-glass rounded-full text-foreground cursor-pointer font-medium active:scale-95 transition-all"
            >
              Аялал эхлүүлэх
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center min-h-[calc(screen-85px)] px-6" id="main-content">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME (Hero Section) */}
          {activeTab === 'home' && (
            <motion.section
              key="home-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="flex flex-col items-center justify-center text-center pt-28 pb-40 py-[90px] min-h-[65vh]"
              id="hero-homescreen"
            >
              {/* Dynamic decorative cinematic word */}
              <motion.span
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 0.25, letterSpacing: '0.25em' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="text-xs uppercase tracking-[0.25em] text-white/50 mb-6 font-medium font-mono"
              >
                УДИРТГАЛ
              </motion.span>

              {/* Headings with Georgia and Editorial sizing */}
              <h1
                id="hero-heading"
                className="text-5xl sm:text-7xl md:text-[88px] leading-[0.92] tracking-[-0.04em] max-w-4xl font-normal text-foreground animate-fade-rise"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Хүсэл-Эрдэнэ <em className="not-italic text-white/50 italic">болон түүний тоглоом</em>
              </h1>
              {/* CTA button */}
              <button
                id="hero-cta-button"
                onClick={() => setActiveTab('game')}
                className="liquid-glass rounded-full px-14 py-5 text-lg text-foreground mt-14 hover:scale-[1.03] transition-transform duration-300 cursor-pointer shadow-xl active:scale-[0.98] animate-fade-rise-delay-2"
              >
                Аяллыг Эхлүүлэх
              </button>
            </motion.section>
          )}

          {/* TAB 2: MY GAME - EMPTY PLACEHOLDER */}
          {activeTab === 'game' && (
            <motion.section
              key="game-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pt-20 pb-32 max-w-4xl mx-auto w-full min-h-[50vh] flex flex-col justify-center items-center"
              id="game-screen"
            >
              <div className="w-full text-center py-20 liquid-glass rounded-none border border-white/5 max-w-2xl">
                {/* Clean, completely empty placeholder awaiting customer instructions */}
                <div className="h-44 flex items-center justify-center">
                  <span className="text-white/20 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
                    Таны тоглоомыг оруулахад бэлэн. Заавраа өгнө үү...
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-foreground cursor-pointer transition-colors px-4 py-2"
                >
                  <ArrowLeft className="size-4" /> Буцах
                </button>
                <button
                  onClick={() => setActiveTab('aboutme')}
                  className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 hover:scale-[1.03] text-white rounded-full px-6 py-2.5 cursor-pointer transition-all border border-white/10 shadow-lg font-medium"
                >
                  Дараагийн хэсэг <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.section>
          )}

          {/* TAB 3: ABOUT ME */}
          {activeTab === 'aboutme' && (
            <motion.section
              key="aboutme-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pt-20 pb-32 max-w-5xl mx-auto w-full min-h-[50vh] flex flex-col justify-center px-4"
              id="aboutme-screen"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Column: Personal info (spans 5 cols on desktop) */}
                <div className="lg:col-span-5 liquid-glass p-8 md:p-10 rounded-none border border-white/5 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
                  {/* Visual Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-5 text-center sm:text-left">
                      <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/40 block mb-1">Миний Тухай</span>
                      <h2 className="text-3xl sm:text-4xl text-foreground font-normal tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                        Танилцуулга
                      </h2>
                    </div>

                    {/* Mongolian Info Details */}
                    <div className="space-y-4 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Нэр:</span>
                        <span className="text-lg sm:text-xl font-light text-foreground" style={{ fontFamily: "'Georgia', serif" }}>Хүсэл-Эрдэнэ</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Төрсөн он:</span>
                        <span className="text-lg sm:text-xl font-light text-foreground" style={{ fontFamily: "'Georgia', serif" }}>2012 он</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Сургууль:</span>
                        <span className="text-base sm:text-lg font-light text-white/90" style={{ fontFamily: "'Georgia', serif" }}>Зуунмод 3-р сургууль</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Хобби:</span>
                        <span className="text-base sm:text-lg font-light text-white/90" style={{ fontFamily: "'Georgia', serif" }}>Дугуй унах, волейбол тоглох</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Дуртай аниме:</span>
                        <span className="text-base sm:text-lg font-light text-white/90" style={{ fontFamily: "'Georgia', serif" }}>Haikyuu</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-white/5 gap-1">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Дуртай хоол:</span>
                        <span className="text-base sm:text-lg font-light text-white/90" style={{ fontFamily: "'Georgia', serif" }}>Монгол хоол</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-white/20 font-light leading-relaxed max-w-xs mx-auto pt-4">
                    * Энэхүү хуудсыг Хүсэл-Эрдэнэд зориулан тусгайлан бүтээв.
                  </p>
                </div>

                {/* Right Column: Rokit Bay Music (spans 7 cols on desktop) */}
                <div className="lg:col-span-7 liquid-glass p-8 md:p-10 rounded-none border border-white/5 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/40 block mb-1">Дуртай Дуучин</span>
                        <h2 className="text-3xl sm:text-4xl text-foreground font-normal tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                          Rokit Bay
                        </h2>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase border border-white/10 px-2 py-1">
                        Монголын Рэп Легенд
                      </span>
                    </div>

                    {/* Main Song: Jinguudsen Puujin Embed */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                          <Music className="size-3 text-white/60 animate-pulse" /> Сонсох: Жингүүдсэн пуужин
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">Official Video</span>
                      </div>
                      
                      {/* Responsive Iframe Container */}
                      <div className="w-full aspect-video border border-white/15 bg-black/40 overflow-hidden relative group">
                        <iframe
                          src="https://www.youtube.com/embed/FOfx6n0_78U"
                          title="Rokit Bay - Жингүүдсэн пуужин"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    {/* Track Excerpt / Lyrics Quote */}
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none space-y-2">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-white/30 block">Дууны Хэсгээс</span>
                      <p className="text-sm italic font-light text-white/90 leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                        "Би бол жингүүдсэн пуужин... Сансар огторгуйн аялагч... Эргэж харахгүй хэзээ ч, дээшээ ниснэ үүлнээс дээгүүр..."
                      </p>
                    </div>

                    {/* Other Popular Rokit Bay tracks list */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-mono uppercase tracking-widest text-white/40 block">Бусад алдартай бүтээлүүдээс:</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between text-white/70">
                          <span>1. Ориг (Orig)</span>
                          <span className="text-[9px] text-white/30">2011</span>
                        </div>
                        <div className="p-2.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between text-white/70">
                          <span>2. Эвдэрхий хүн</span>
                          <span className="text-[9px] text-white/30">2013</span>
                        </div>
                        <div className="p-2.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between text-white/70">
                          <span>3. Бид 2 (Bid 2)</span>
                          <span className="text-[9px] text-white/30">2014</span>
                        </div>
                        <div className="p-2.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between text-white/70">
                          <span>4. Бор арьст Гаамп</span>
                          <span className="text-[9px] text-white/30">2012</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                <button
                  onClick={() => setActiveTab('game')}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-foreground cursor-pointer transition-colors px-4 py-2 font-mono uppercase tracking-widest"
                >
                  <ArrowLeft className="size-4" /> Буцах
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 hover:scale-[1.03] text-white rounded-full px-6 py-2.5 cursor-pointer transition-all border border-white/10 shadow-lg font-medium"
                >
                  Дараагийн хэсэг <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.section>
          )}

          {/* TAB 4: MY ADDRESS */}
          {activeTab === 'address' && (
            <motion.section
              key="address-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pt-20 pb-32 max-w-2xl mx-auto w-full min-h-[50vh] flex flex-col justify-center"
              id="address-screen"
            >
              <div className="liquid-glass p-10 md:p-12 rounded-none border border-white/5 space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Visual Accent decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

                <div className="border-b border-white/10 pb-6 text-center sm:text-left">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/40 block mb-2">Миний Хаяг</span>
                  <h2 className="text-4xl sm:text-5xl text-foreground font-normal tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                    Холбоо Барих
                  </h2>
                </div>

                {/* Mongolian Address details */}
                <div className="space-y-6 pt-2">
                  <div className="flex flex-col py-4 border-b border-white/5 gap-2">
                    <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Гэрийн хаяг:</span>
                    <span className="text-xl sm:text-2xl font-light text-foreground leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                      Кино үйлдвэр, 9А байр, 2 тоот
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-white/5 gap-2">
                    <span className="text-sm font-mono text-white/40 uppercase tracking-widest">Холбогдох дугаар:</span>
                    <span className="text-xl sm:text-2xl font-light text-foreground" style={{ fontFamily: "'Georgia', serif" }}>
                      95412741
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-white/30 font-light leading-relaxed max-w-md mx-auto pt-4">
                  * Холбоо барих мэдээллийг аюулгүй байдлын үүднээс хамгаалсан болно.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <button
                  onClick={() => setActiveTab('aboutme')}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-foreground cursor-pointer transition-colors px-4 py-2"
                >
                  <ArrowLeft className="size-4" /> Буцах
                </button>
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2 text-sm bg-white text-black hover:bg-white/90 hover:scale-[1.03] rounded-full px-6 py-2.5 cursor-pointer transition-all shadow-lg font-medium"
                >
                  Эхлэл рүү очих <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </main>

      {/* Elegant Background Music Player Panel in Footer (Arin hesegt) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-6" id="bg-music-panel">
        <div className="liquid-glass border border-white/5 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
              <Music className={`size-5 ${!isMuted ? 'animate-spin text-white' : ''}`} style={{ animationDuration: '8s' }} />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-0.5">Арын Дуу (Background Track)</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-light text-foreground" style={{ fontFamily: "'Georgia', serif" }}>
                  Мөрөөдлийн тоглоом (Хүсэл-Эрдэнэ • Suno AI)
                </span>
                <a 
                  href="https://suno.com/song/cGzovQEKSJztgbBI" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-white/40 hover:text-white underline cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  Suno дээр сонсох ↗
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0">
            {/* Real-time equalizing bar animation */}
            {!isMuted ? (
              <div className="flex items-end gap-0.5 h-4 w-7 px-1 shrink-0">
                <span className="w-0.5 bg-white/70 animate-musicBar" style={{ height: '30%', animationDelay: '0.1s' }} />
                <span className="w-0.5 bg-white/70 animate-musicBar" style={{ height: '60%', animationDelay: '0.4s' }} />
                <span className="w-0.5 bg-white/70 animate-musicBar" style={{ height: '40%', animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-white/70 animate-musicBar" style={{ height: '80%', animationDelay: '0.5s' }} />
                <span className="w-0.5 bg-white/70 animate-musicBar" style={{ height: '50%', animationDelay: '0.3s' }} />
              </div>
            ) : (
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider shrink-0">Чимээгүй</span>
            )}
            
            <button
              onClick={toggleSound}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 px-5 py-2.5 rounded-full cursor-pointer transition-all active:scale-95"
            >
              {isMuted ? (
                <>
                  <Play className="size-3 fill-current" /> Тоглуулах
                </>
              ) : (
                <>
                  <Pause className="size-3 fill-current" /> Түр зогсоох
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic Coordinates Footer */}
      <footer className="relative z-10 w-full" id="coordinates-footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] uppercase tracking-widest text-[#939393]/40 font-medium border-t border-white/5 gap-4">
          <div className="flex items-center space-x-6">
            <span>ХҮСЭЛ-ЭРДЭНЭ © 2026</span>
            <span>•</span>
            <span className="hidden sm:inline">LAT 45.109 / LON -122.680</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-foreground cursor-pointer transition-all" onClick={() => setActiveTab('game')}>МИНИЙ ТОГЛООМ</span>
            <span>/</span>
            <span className="hover:text-foreground cursor-pointer transition-all" onClick={() => setActiveTab('aboutme')}>МИНИЙ ТУХАЙ</span>
            <span>/</span>
            <span className="hover:text-foreground cursor-pointer transition-all" onClick={() => setActiveTab('address')}>МИНИЙ ХАЯГ</span>
          </div>
        </div>
      </footer>

      {/* Native HTML5 Audio Element for Background Music with no-referrer & auto fallbacks */}
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        preload="auto"
        referrerPolicy="no-referrer"
        onError={handleAudioError}
      />
    </div>
  );
}
