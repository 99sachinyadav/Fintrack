import { ArrowRight, BarChart2, ShieldCheck, Sparkles, TrendingUp, Zap, Activity, Lock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import faceImage from '../assets/faceimage.gif';

const mockChartData = [
  { month: "Jan", portfolio: 42000, algorithmic: 45000 },
  { month: "Feb", portfolio: 43500, algorithmic: 48000 },
  { month: "Mar", portfolio: 41000, algorithmic: 52000 },
  { month: "Apr", portfolio: 46000, algorithmic: 61000 },
  { month: "May", portfolio: 45000, algorithmic: 65000 },
  { month: "Jun", portfolio: 49000, algorithmic: 74000 },
];

export default function LandingPage() {
  const functionalities = [
    "Predictive Wealth Insights.",
    "Institutional Risk Radar.",
    "Smart Collateral Tracking.",
    "Algorithmic Liquidity.",
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % functionalities.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all">
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 text-cyan-400">
            <TrendingUp size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FinTrack</span>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 px-3 py-2 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 px-5 py-2 text-sm font-bold text-cyan-300 transition-all hover:bg-cyan-500 hover:text-black">
            Sign Up <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-[80vh] flex items-center justify-center">
        {/* Interactive Dots Architecture Background */}
        <div className="absolute inset-0 z-0">
          <InteractiveParticles />
        </div>

        {/* Dynamic GIF Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-80 mix-blend-screen xl:scale-110">
          <img 
            src={faceImage} 
            alt="Landing Theme GIF" 
            className="object-cover w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full blur-[1px]"
          />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(24,217,255,0.08),transparent_60%)] pointer-events-none z-0" />
        
        <div className="relative z-10 mx-auto max-w-[1000px] text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 tracking-wide mb-8 shadow-[0_0_20px_rgba(24,217,255,0.2)]">
            <Sparkles size={14} className="animate-pulse" />
            FinTrack Intelligence Protocol Active
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[85px] font-bold tracking-tighter leading-[1.05] text-white mix-blend-screen drop-shadow-2xl">
            Compound your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">wealth</span>,<br />
            minimize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">risk</span>.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Harness high-frequency data pipelines and AI-driven market analysis to make institutional-grade financial decisions from a single dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link to="/register" className="group flex items-center justify-center w-full sm:w-auto rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Enter Platform <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>

      {/* Animated Capabilities Section */}
      <section className="relative py-16 bg-black/80 backdrop-blur-sm border-y border-white/5 z-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
           <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-slate-300 flex flex-col md:flex-row items-center justify-center gap-3">
             <span>Unleash the power of</span>
             <span className={`inline-block min-w-[300px] text-left text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bold transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
               {functionalities[currentWordIndex]}
             </span>
           </h2>
        </div>
      </section>

      {/* Data Visualisation Showcase */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
              <Activity size={20} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Real-time Performance Modeling</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Watch your assets grow with predictive charting. Our platform compares standard portfolio holding against our proprietary <span className="text-cyan-400 font-semibold">Algorithmic Rebalancing Engine</span>, projecting years into the future.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                <div className="w-3 h-3 rounded-full bg-slate-500" /> Standard Hold
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" /> FinTrack Alpha
              </div>
            </div>
          </div>
          
          <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#050505] rounded-[22px] p-6 h-[400px] w-full relative overflow-hidden border border-white/5">
              <div className="absolute top-4 left-6 z-10 text-xl font-bold text-white tracking-tight flex flex-col">
                $74,000.00
                <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 mt-1"><TrendingUp size={12}/> +76.1% Yield</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className={"pt-12"}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorAlgorithmic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#334155" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="portfolio" stroke="#64748b" fillOpacity={1} fill="url(#colorPortfolio)" />
                  <Area type="monotone" dataKey="algorithmic" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorAlgorithmic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Features Data Elements */}
      <section id="features" className="relative z-10 mx-auto max-w-[1200px] px-6 py-20 bg-black/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Enterprise-grade tools for individual investors.</h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Analyze, execute, and monitor with components explicitly designed for zero-latency intelligence.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<BarChart2 />}
            title="Future Wealth Simulation"
            desc="Model your asset compound growth across decades. Adjust return variables in real-time to plan your ultimate portfolio strategy."
            metric="1M+ Variables"
          />
          <FeatureCard 
            icon={<ShieldCheck />}
            title="Risk Assessment Radar"
            desc="AI mapping of your portfolio across growth, stability, and volatility quadrants. Visualize your exposure instantly."
            metric="Live Tracking"
          />
          <FeatureCard 
            icon={<Zap />}
            title="Collateral Health Checks"
            desc="Borrowing against crypto or stocks? We calculate your liquidation points automatically before market dips catch you off guard."
            metric="< 50ms Latency"
          />
        </div>
      </section>

      {/* Clean Call to Action */}
      <section className="relative overflow-hidden py-32 px-6 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.1),transparent_50%)] z-0" />
        <div className="relative z-10 mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-12 md:p-20 text-center shadow-2xl overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-20"><Lock size={120} /></div>
           
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 relative z-10">
             Ready to secure your autonomy?
           </h2>
           <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto relative z-10">
             Join thousands of modern investors leveraging FinTrack AI to stay consistently ahead of the curve.
           </p>
           <Link to="/register" className="inline-flex relative z-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(24,217,255,0.3)]">
              Create Secure Account <ArrowRight size={18} className="ml-2" />
           </Link>
        </div>
      </section>

      {/* Footer with massive glowing arc representing the 3rd image */}
      <footer className="relative w-full pt-40 pb-12 overflow-hidden bg-black z-10">
         {/* Glowing Arc Replicating the Image provided */}
         <div className="absolute bottom-[20%] left-[50%] w-[180%] md:w-[120%] h-[800px] md:h-[1200px] flex items-center justify-center transform -translate-x-1/2 pointer-events-none">
            {/* Inner purple core */}
            <div className="absolute w-[100%] h-[100%] rounded-[100%] border-[2px] border-purple-400 shadow-[0_0_100px_50px_rgba(168,85,247,0.5),inset_0_0_80px_20px_rgba(168,85,247,0.3)] bg-gradient-to-b from-[#140632]/80 to-transparent z-10 opacity-70"></div>
            {/* Bright cyan/blue reflection layer */}
            <div className="absolute bottom-[5%] w-[98%] h-[98%] rounded-[100%] border-[4px] border-[#6b8cff] shadow-[0_0_150px_rgba(107,140,255,0.8),inset_0_0_150px_rgba(107,140,255,0.4)] opacity-80 mix-blend-screen z-20"></div>
            {/* Core absolute light stroke */}
            <div className="absolute bottom-[8%] w-[96%] h-[96%] rounded-[100%] border-t-[8px] border-white shadow-[0_0_80px_rgba(255,255,255,1)] opacity-90 blur-[2px] z-30"></div>
         </div>

         {/* Floating Footer content over the arc */}
         <div className="relative z-40 mx-auto max-w-[1200px] px-6 text-center">
            {/* Cool text effect requested for footer */}
            <h2 className="text-6xl md:text-9xl font-black mt-20 mb-8 tracking-tighter" style={{
              backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, rgba(255, 255, 255, 0) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.1)'
            }}>
              FINTRACK
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/10 mt-12">
              <div className="text-sm font-medium text-slate-300 shadow-sm backdrop-blur-md px-4 py-2 rounded-full bg-white/5 border border-white/10">© 2026 FinTrack AI Technologies.</div>
              <div className="flex gap-6 text-sm font-medium text-slate-300">
                 <a href="#" className="hover:text-cyan-400 transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:border-cyan-500/50">Privacy</a>
                 <a href="#" className="hover:text-cyan-400 transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:border-cyan-500/50">Terms</a>
                 <a href="#" className="hover:text-cyan-400 transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:border-cyan-500/50">GitHub</a>
              </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, metric }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#080808]/80 backdrop-blur-md p-8 transition-all duration-300 hover:border-cyan-500/30 hover:bg-[#0c0c10] hover:-translate-y-1 shadow-lg group">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-300 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
          {icon}
        </div>
        <div className="text-xs font-bold text-cyan-500/50 bg-cyan-500/5 px-3 py-1 rounded-full group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
          {metric}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mt-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

// Particle Engine for "Dots architecture which distributes on hover"
function InteractiveParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const particles = [];
    const maxParticles = 100;
    
    const mouse = { x: -1000, y: -1000, radius: 150 };

    const handleMouseMove = (e) => {
      // Get mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.density = (Math.random() * 30) + 1;
      }
      
      update() {
        // Natural drift
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around screen
        if (this.x > w) this.x = 0;
        if (this.x < 0) this.x = w;
        if (this.y > h) this.y = 0;
        if (this.y < 0) this.y = h;

        // Interaction (distribute on hover)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Return to base position slightly if we wanted snapping, 
          // but continuous drift is more organic.
        }
      }
      
      draw() {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)'; // Cyan-400 with opacity
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = dx * dx + dy * dy;

          if (distance < (w/10) * (h/10)) {
            let opacity = 1 - (distance / ((w/10) * (h/10)));
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.2})`; // Slate-400 faint lines
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block"
      style={{ backgroundColor: 'transparent' }}
    />
  );
}
