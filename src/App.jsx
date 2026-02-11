import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Briefcase, Building, LogIn, LogOut, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import usiLogo from './assets/usi-logo.avif';

const Header = () => (
  <header className="bg-usi-green text-white shadow-lg border-b-4 border-usi-gold">
    <div className="max-w-4xl mx-auto p-6 flex items-center gap-4">
      {/* Updated Logo Section */}
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
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('usi-attendance-logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('usi-attendance-logs', JSON.stringify(logs));
  }, [logs]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLog = (type) => {
    if (!formData.name) {
      alert("Please enter the employee name.");
      return;
    }

    const newLog = {
      id: Date.now(),
      ...formData,
      type,
      timestamp: new Date().toISOString(),
    };

    setLogs([newLog, ...logs]);
  };

  const clearLogs = () => {
    if(confirm("Are you sure you want to clear the history?")) {
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        
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
          
          <section>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <User className="text-usi-gold"/> Employee Entry
              </h3>
              
              <InputField 
                label="Employee Name" 
                name="name" 
                placeholder="e.g. Juan Dela Cruz" 
                value={formData.name}
                onChange={handleInputChange}
                icon={User}
              />
              
              <InputField 
                label="Designation/Title" 
                name="designation" 
                placeholder="e.g. Senior Lecturer" 
                value={formData.designation}
                onChange={handleInputChange}
                icon={Briefcase}
              />
              
              <InputField 
                label="Department / Office" 
                name="department" 
                placeholder="e.g. College of Computer Studies" 
                value={formData.department}
                onChange={handleInputChange}
                icon={Building}
              />

              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLog('Time-In')}
                  className="bg-usi-green hover:bg-green-800 text-white p-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <LogIn size={32} />
                  TIME IN
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLog('Time-Out')}
                  className="bg-usi-gold hover:bg-yellow-500 text-usi-green p-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <LogOut size={32} />
                  TIME OUT
                </motion.button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-slate-800">Recent Logs</h3>
              <button onClick={clearLogs} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-3 py-1 rounded-lg transition-colors">
                <Trash2 size={18}/> Clear History
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence>
                {logs.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="bg-slate-100 rounded-xl p-8 text-center"
                  >
                    <p className="text-slate-500 text-lg">No records found today.</p>
                    <p className="text-slate-400 text-sm mt-2">Entries will appear here automatically.</p>
                  </motion.div>
                )}
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                    className={`bg-white p-5 rounded-xl shadow-sm border-l-[6px] ${
                      log.type === 'Time-In' ? 'border-usi-green' : 'border-usi-gold'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-xl text-slate-800 leading-tight">{log.name}</h4>
                        <p className="text-slate-500 font-medium text-sm mt-1">{log.designation}</p>
                        <p className="text-slate-400 text-xs uppercase tracking-wide">{log.department}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        log.type === 'Time-In' 
                          ? 'bg-green-100 text-usi-green ring-1 ring-green-200' 
                          : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Time Logged</span>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={16} className="text-usi-gold"/>
                        <span className="font-mono font-bold text-lg">
                          {format(new Date(log.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;