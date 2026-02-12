import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Briefcase, Building, LogIn, LogOut, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import usiLogo from './assets/usi-logo.avif';
import { supabase } from './supabaseClient';

const Header = () => (
  <header className="bg-usi-green text-white shadow-lg border-b-4 border-usi-gold">
    <div className="max-w-4xl mx-auto p-6 flex items-center gap-4">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-usi-gold shadow-md overflow-hidden">
        <img 
          src={usiLogo} 
          alt="USI Logo" 
          className="w-full h-full object-contain p-1" 
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight leading-tight">Daily Attendance Log</h1>
        <p className="text-usi-gold font-medium text-lg uppercase tracking-wider">Universidad de Santa Isabel</p>
      </div>
    </div>
  </header>
);

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="mb-5">
    <label className="block text-slate-700 font-bold text-lg mb-2 flex items-center gap-2">
      <Icon size={20} className="text-usi-green" />
      {label}
    </label>
    <input 
      className="w-full p-4 text-xl border-2 border-slate-300 rounded-xl focus:border-usi-green transition-colors bg-white shadow-sm placeholder:text-slate-300"
      {...props}
    />
  </div>
);

function App() {
  const [formData, setFormData] = useState({ name: '', designation: '', department: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Logs & Set up Real-time Subscription
  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'attendance' }, 
        (payload) => {
          setLogs((currentLogs) => [payload.new, ...currentLogs]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) console.error('Error fetching:', error);
    else setLogs(data || []);
    setLoading(false);
  }

  // 3. Handle Input Changes (The missing function!)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Save to Supabase
  const handleLog = async (type) => {
    if (!formData.name) return alert("Please enter employee name.");

    const { error } = await supabase
      .from('attendance')
      .insert([{ 
        name: formData.name, 
        designation: formData.designation, 
        department: formData.department,
        type: type 
      }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Clear name only after success to prevent double-clicks
      setFormData(prev => ({ ...prev, name: '', designation: '', department: '' }));
    }
  }; 

  const clearLogs = async () => {
    if(confirm("This will clear the visual list. Are you sure?")) {
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        
        {/* Clock Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-usi-gold mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-slate-500 text-xl font-medium">Current Date & Time</h2>
            <p className="text-4xl sm:text-5xl font-bold text-usi-green tracking-tight">
              {format(currentTime, 'h:mm:ss a')}
            </p>
            <p className="text-slate-600 text-lg">
              {format(currentTime, 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <Clock size={64} className="text-usi-gold opacity-80 hidden sm:block" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Entry Form */}
          <section>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <User className="text-usi-gold"/> Employee Entry
              </h3>
              
              <InputField 
                label="Employee Name" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleInputChange}
                icon={User}
              />
              
              <InputField 
                label="Designation" 
                name="designation" 
                placeholder="e.g. Teacher" 
                value={formData.designation}
                onChange={handleInputChange}
                icon={Briefcase}
              />
              
              <InputField 
                label="Department" 
                name="department" 
                placeholder="Office Location" 
                value={formData.department}
                onChange={handleInputChange}
                icon={Building}
              />

              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLog('Time-In')}
                  className="bg-usi-green hover:bg-green-800 text-white p-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-2 shadow-md transition-all"
                >
                  <LogIn size={32} />
                  TIME IN
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLog('Time-Out')}
                  className="bg-usi-gold hover:bg-yellow-500 text-usi-green p-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-2 shadow-md transition-all"
                >
                  <LogOut size={32} />
                  TIME OUT
                </motion.button>
              </div>
            </div>
          </section>

          {/* Logs List */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-slate-800">Recent Logs</h3>
              <button onClick={clearLogs} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-3 py-1 rounded-lg transition-colors">
                <Trash2 size={18}/> Clear
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {loading ? (
                  <p className="text-center py-10 text-slate-400">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-100 rounded-xl p-8 text-center">
                    <p className="text-slate-500 text-lg">No records found.</p>
                  </motion.div>
                ) : (
                  logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white p-5 rounded-xl shadow-sm border-l-[6px] ${
                        log.type === 'Time-In' ? 'border-usi-green' : 'border-usi-gold'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xl text-slate-800">{log.name}</h4>
                          <p className="text-slate-500 text-sm">{log.designation} • {log.department}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          log.type === 'Time-In' ? 'bg-green-100 text-usi-green' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-slate-600">
                        <span className="text-xs uppercase font-bold tracking-widest opacity-50">Logged At</span>
                        <span className="font-mono font-bold text-lg">
                          {format(new Date(log.created_at), 'h:mm a')}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;