import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Users, ArrowRight, Code, Linkedin, Globe, CheckCircle2, BookOpen } from 'lucide-react';
import { AcropolisLogo } from '../components/UI';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed w-full z-50 top-0 left-0 border-b border-slate-200/50 bg-white/70 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AcropolisLogo className="h-8 w-auto" variant="dashboard" />
            <span className="font-black text-xl tracking-tighter text-indigo-900 hidden sm:block">Acropolis</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="group bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:scale-95"
          >
            Portal Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center px-6 bg-white overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -60, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.span variants={itemVariants} className="inline-block py-1 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black tracking-widest uppercase mb-6 shadow-sm">
            Acropolis Student Portal
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight text-slate-900">
            Your College Life, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Simplified.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Say goodbye to outdated systems and messy spreadsheets. Check your attendance, track your marks, and manage your classes in seconds.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="group w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#about-app" className="w-full sm:w-auto bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* About App Section */}
      <section id="about-app" className="py-24 bg-slate-50 relative border-y border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Everything you need in one place</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Built to replace confusing paperwork and endless WhatsApp groups.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Track Attendance", desc: "No more guessing if you're short on attendance. Faculty updates are instant, so you always know exactly where you stand.", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100", border: "hover:border-blue-300" },
              { title: "Complete Privacy", desc: "Your data is strictly yours. Nobody else can peek at your grades or personal details except you and your teachers.", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100", border: "hover:border-emerald-300" },
              { title: "No Training Needed", desc: "We hated complicated college portals as much as you do. We designed this to be as easy to use as your favorite app.", icon: Users, color: "text-purple-600", bg: "bg-purple-100", border: "hover:border-purple-300" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
                className={`p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-colors duration-300 ${feature.border}`}
              >
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Developer Section */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-md mx-auto lg:max-w-lg group"
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                src="/aayush-profile.jpg" 
                alt="Aayush Sharma" 
                /* IMPORTANT: mix-blend-multiply perfectly removes a white background and blends it into the container! */
                className="w-full h-auto object-contain mix-blend-multiply"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Aayush+Sharma&background=4f46e5&color=fff&size=1024';
                  (e.target as HTMLImageElement).classList.remove('mix-blend-multiply');
                }}
              />
            </motion.div>

            {/* Content Side */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-8"
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6"
                >
                  <Code className="h-4 w-4" /> About the Creator
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
                  Hi, I'm Aayush Sharma.
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  I got tired of dealing with slow, clunky college websites, so I decided to build a better one. This platform was made from scratch to actually solve problems for our students and faculty, without the headaches.
                </p>
                
                <div className="space-y-5 mb-10">
                  {[
                    "Handcrafted to be fast and lightweight",
                    "Runs smoothly on both phones and laptops",
                    "No annoying pop-ups or cluttered menus"
                  ].map((text, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors"
                    >
                      <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-slate-700 font-bold text-lg">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.linkedin.com/in/aayush-sharma-2013d" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-[#0A66C2] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[#0A66C2]/30 hover:shadow-[#0A66C2]/50 transition-all"
                >
                  <Linkedin className="h-5 w-5" /> LinkedIn Profile
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://aayush-sharma-beige.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-sm hover:border-slate-300 transition-all"
                >
                  <Globe className="h-5 w-5" /> My Portfolio
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 text-slate-500 text-center text-sm border-t border-slate-200">
        <p className="font-medium text-slate-400">
          © {new Date().getFullYear()} Acropolis Management System. Built with passion by Aayush Sharma.
        </p>
      </footer>
    </div>
  );
};
