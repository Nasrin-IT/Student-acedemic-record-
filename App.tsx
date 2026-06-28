
import React, { useState, useEffect } from 'react';
import { User, UserRole, StudentProfile } from './types';
import { Login } from './components/Login';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { RecordBook } from './components/RecordBook/RecordBook';
import { getStudentByRoll, createEmptyProfile, saveStudent } from './studentService';
import { ALLOWED_ROLL_NUMBERS } from './constants';
import { Button } from './components/Button';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('spcet_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('spcet_user', JSON.stringify(user));
      
      if (user.role !== UserRole.ADMIN && user.rollNumber) {
        getStudentByRoll(user.rollNumber).then(profile => {
          if (profile) {
            setStudentProfile(profile);
          } else {
            // Initialize profile if it doesn't exist
            const newProfile = createEmptyProfile(user.rollNumber!, ALLOWED_ROLL_NUMBERS[user.rollNumber!]);
            saveStudent(newProfile).then(() => {
              setStudentProfile(newProfile);
            });
          }
        }).catch(err => {
          console.error("Failed to load student profile:", err);
        });
      }
    } else {
      sessionStorage.removeItem('spcet_user');
      setStudentProfile(null);
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Student and Parent view their specific book directly
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-12">
      {/* Role specific header */}
      <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            {user.role === UserRole.STUDENT ? 'Student Portal' : 'Parent Portal'}
          </h2>
          <p className="text-sm text-gray-500">Welcome, {ALLOWED_ROLL_NUMBERS[user.rollNumber!]}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {studentProfile && (
        <RecordBook 
          profile={studentProfile} 
          role={user.role} 
          onUpdate={setStudentProfile}
        />
      )}
    </div>
  );
};

export default App;
