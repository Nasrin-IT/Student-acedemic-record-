import React, { useState, useEffect } from 'react';
import { StudentProfile, UserRole } from '../../types';
import { getStudents, deleteStudent, createEmptyProfile, saveStudent } from '../../studentService';
import { Button } from '../Button';
import { RecordBook } from '../RecordBook/RecordBook';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Plus, 
  Trash2, 
  BookOpen, 
  LogOut, 
  SlidersHorizontal, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  X 
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof StudentProfile>('fullName');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Manual adding state
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');

  // Excel importing state
  const [importTab, setImportTab] = useState<'manual' | 'excel'>('manual');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<{ rollNumber: string; fullName: string }[]>([]);
  const [excelError, setExcelError] = useState('');

  const fetchStudents = () => {
    getStudents().then(data => {
      setStudents(data);
    }).catch(err => {
      console.error('Failed to load students:', err);
    });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this student record?')) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (err) {
        console.error('Failed to delete student:', err);
      }
    }
  };

  const handleAddStudent = async () => {
    if (!newRoll || !newName) return;
    const profile = createEmptyProfile(newRoll.trim(), newName.trim());
    try {
      await saveStudent(profile);
      fetchStudents();
      setIsAdding(false);
      setNewRoll('');
      setNewName('');
      setSelectedStudent(profile);
    } catch (err) {
      console.error('Failed to add student:', err);
    }
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setExcelError('');
    setParsedStudents([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          setExcelError('The uploaded sheet appears to be empty.');
          return;
        }

        const list: { rollNumber: string; fullName: string }[] = [];
        data.forEach((row: any, index) => {
          // Match standard column header keys or fallback to index position
          const roll = String(
            row['Roll Number'] || 
            row['rollNumber'] || 
            row['Roll No'] || 
            row['RollNo'] || 
            row['roll_no'] || 
            row['Register No'] || 
            row['Register Number'] || 
            Object.values(row)[0] || 
            ''
          ).trim();

          const name = String(
            row['Full Name'] || 
            row['fullName'] || 
            row['Name'] || 
            row['name'] || 
            row['Student Name'] || 
            Object.values(row)[1] || 
            ''
          ).trim();

          // Simple sanitation
          if (roll && name && roll !== 'undefined' && name !== 'undefined' && roll !== '[object Object]') {
            list.push({ rollNumber: roll, fullName: name });
          }
        });

        if (list.length === 0) {
          setExcelError('Could not parse student columns. Ensure your Excel file has columns labeled "Roll Number" and "Full Name".');
        } else {
          setParsedStudents(list);
        }
      } catch (err) {
        setExcelError('Failed to read file. Please ensure it is a valid Excel or CSV spreadsheet.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportExcelData = async () => {
    if (parsedStudents.length === 0) return;
    
    try {
      for (const item of parsedStudents) {
        const profile = createEmptyProfile(item.rollNumber, item.fullName);
        await saveStudent(profile);
      }
      fetchStudents();
      setIsAdding(false);
      setExcelFile(null);
      setParsedStudents([]);
      setExcelError('');
    } catch (err) {
      console.error('Failed to import students:', err);
    }
  };

  const filteredStudents = students
    .filter(s => 
      s.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.rollNumber.includes(search)
    )
    .sort((a, b) => {
      const valA = String(a[sortBy] || '').toLowerCase();
      const valB = String(b[sortBy] || '').toLowerCase();
      return valA < valB ? -1 : 1;
    });

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-12 overflow-x-hidden">
        <RecordBook 
          profile={selectedStudent} 
          role={UserRole.ADMIN} 
          onUpdate={(updated) => {
            setSelectedStudent(updated);
            fetchStudents();
          }}
          onClose={() => setSelectedStudent(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Student Profile Management System</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={() => { setIsAdding(true); setImportTab('manual'); setExcelFile(null); setParsedStudents([]); setExcelError(''); }}>
            <Plus className="w-4 h-4 mr-2" /> Add New Student
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-hidden">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="text-gray-400 w-4 h-4" />
            <select 
              className="flex-1 border rounded-lg px-4 py-2 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="fullName">Sort by Name</option>
              <option value="rollNumber">Sort by Roll No</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Roll Number</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.length > 0 ? filteredStudents.map(student => {
                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-blue-700">{student.rollNumber}</td>
                    <td className="px-6 py-4">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.branch}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="p-1 h-8 w-8" onClick={() => setSelectedStudent(student)}>
                          <BookOpen className="w-4 h-4" />
                        </Button>
                        <button 
                          onClick={(e) => handleDelete(student.id, e)}
                          className="p-1 h-8 w-8 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Import Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">Add Student Profiles</h2>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab selector */}
            <div className="flex border-b mb-6">
              <button 
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${importTab === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setImportTab('manual')}
              >
                Fill Manually
              </button>
              <button 
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${importTab === 'excel' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setImportTab('excel')}
              >
                Upload Excel / CSV
              </button>
            </div>

            {importTab === 'manual' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ROLL NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 112723205007"
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newRoll} 
                    onChange={e => setNewRoll(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">FULL NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ASHWINI S"
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button className="flex-1" onClick={handleAddStudent}>Create Profile</Button>
                  <Button variant="secondary" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50/50 transition-colors relative cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleExcelChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="w-10 h-10 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-gray-700">
                      {excelFile ? excelFile.name : 'Choose or drag Excel / CSV file'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports column headers: "Roll Number" and "Full Name"</p>
                  </div>
                </div>

                {excelError && (
                  <div className="mt-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{excelError}</span>
                  </div>
                )}

                {parsedStudents.length > 0 && (
                  <div className="flex-1 flex flex-col min-h-0 mt-4">
                    <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg border border-emerald-100 flex items-center space-x-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Successfully parsed {parsedStudents.length} student records!</span>
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-lg divide-y bg-gray-50/50 max-h-48 text-xs">
                      {parsedStudents.map((st, i) => (
                        <div key={i} className="flex justify-between p-2 hover:bg-white">
                          <span className="font-mono text-blue-700 font-medium">{st.rollNumber}</span>
                          <span className="font-medium text-gray-800">{st.fullName}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3 pt-4 mt-auto">
                      <Button className="flex-1" onClick={handleImportExcelData}>Import {parsedStudents.length} Students</Button>
                      <Button variant="secondary" className="flex-1" onClick={() => { setExcelFile(null); setParsedStudents([]); }}>Clear</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
