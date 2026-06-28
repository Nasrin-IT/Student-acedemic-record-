
import React, { useState, useRef } from 'react';
import { StudentProfile, UserRole, Semester, DocumentFile } from '../../types';
import { BookCover } from './BookCover';
import { PageWrapper } from './PageWrapper';
import { Button } from '../Button';
import { saveStudent } from '../../studentService';
import { COLLEGE_NAME, COLLEGE_ADDRESS } from '../../constants';
import { ChevronLeft, ChevronRight, Edit3, Save, X, Trash2, Upload, FileText, Download, Camera, LayoutGrid } from 'lucide-react';

interface RecordBookProps {
  profile: StudentProfile;
  role: UserRole;
  onUpdate?: (updated: StudentProfile) => void;
  onClose?: () => void;
}

export const RecordBook: React.FC<RecordBookProps> = ({ profile: initialProfile, role, onUpdate, onClose }) => {
  // Page structure: 
  // 0: Profile + Personal Details
  // 1: Sem 1 + 2
  // 2: Sem 3 + 4
  // 3: Sem 5 + 6
  // 4: Sem 7 + 8
  // 5: Documents
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); 
  const [isEditing, setIsEditing] = useState(false);
  const [isTurning, setIsTurning] = useState<'next' | 'prev' | null>(null);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const canEdit = role === UserRole.ADMIN || role === UserRole.STUDENT;
  const maxPages = 5;

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await saveStudent(profile);
      setIsEditing(false);
      if (onUpdate) onUpdate(profile);
    } catch (err) {
      console.error("Failed to save student profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isTurning) return;
    setIsTurning(direction);
    
    setTimeout(() => {
      setCurrentPage(prev => direction === 'next' ? Math.min(maxPages, prev + 1) : Math.max(0, prev - 1));
      setIsTurning(null);
    }, 800);
  };

  const jumpToPage = (pageNum: number) => {
    if (pageNum === currentPage) return;
    setIsTurning(pageNum > currentPage ? 'next' : 'prev');
    setTimeout(() => {
      setCurrentPage(pageNum);
      setIsTurning(null);
      setShowJumpMenu(false);
    }, 400);
  };

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSemesterMarkChange = (semIndex: number, markIndex: number, field: 'code' | 'subject' | 'grade', value: string) => {
    const newSemesters = [...profile.semesters];
    newSemesters[semIndex].marks[markIndex] = { ...newSemesters[semIndex].marks[markIndex], [field]: value };
    setProfile(prev => ({ ...prev, semesters: newSemesters }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setProfile(prev => ({ ...prev, photo: base64 }));
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      const newDoc: DocumentFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        data: base64
      };
      setProfile(prev => ({ 
        ...prev, 
        certificates: [...(prev.certificates || []), newDoc] 
      }));
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Delete this document permanently?')) {
      setProfile(prev => ({
        ...prev,
        certificates: prev.certificates.filter(d => d.id !== id)
      }));
    }
  };

  const handleDownload = (doc: DocumentFile) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPersonalDetailsPage = () => (
    <div className="space-y-4 text-sm academic-font">
      {[
        { n: '1.', label: 'Name of the Student', key: 'fullName' },
        { n: '2.', label: 'Programme & Branch', key: 'branch', customVal: `${profile.programme} (${profile.branch})` },
        { n: '3.', label: 'Register No.', key: 'registerNo' },
        { n: '4.', label: 'Period of Academic study', key: 'academicYear' },
        { n: '5.', label: 'Sex', key: 'gender' },
        { n: '6.', label: 'Community', key: 'community' },
        { n: '7.', label: 'Date of Birth', key: 'dob' },
        { n: '8.', label: 'Blood Group', key: 'bloodGroup' },
        { n: '9.', label: 'Father Details', key: 'fatherName', sub: `${profile.fatherOccupation}, Mobile: ${profile.fatherPhone}` },
        { n: '10.', label: 'Mother Details', key: 'motherName', sub: `${profile.motherOccupation}, Mobile: ${profile.motherPhone}` },
        { n: '11.', label: 'Annual Income', key: 'annualIncomeFather', inline: true },
        { n: '12.', label: 'Communication Address', key: 'communicationAddress', multiline: true },
      ].map((item, i) => (
        <div key={i} className="flex space-x-2">
          <span className="w-6 font-bold">{item.n}</span>
          <div className="flex-1">
             <label className="text-gray-600 block mb-0.5 text-[10px] uppercase font-bold tracking-tighter">{item.label}</label>
             {isEditing ? (
                <input 
                  className="w-full border-b border-gray-300 outline-none p-1 bg-blue-50/30" 
                  value={profile[item.key as keyof StudentProfile] as string || ''}
                  onChange={(e) => handleInputChange(item.key as keyof StudentProfile, e.target.value)}
                />
             ) : (
                <p className="font-bold text-blue-900 border-b border-dotted border-gray-300 min-h-[1.5rem]">
                  {item.customVal || profile[item.key as keyof StudentProfile] as string || '---'}
                </p>
             )}
             {item.sub && <p className="text-[10px] text-gray-400 italic mt-1">{item.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSemesterMarks = (semIndex: number) => {
    const semester = profile.semesters[semIndex];
    if (!semester) return null;
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    
    return (
      <div className="mb-6">
        <h4 className="font-bold text-xs mb-2 uppercase border-b border-gray-900 inline-block">{romanNumerals[semester.number-1]} SEMESTER</h4>
        <table className="w-full border-collapse border border-gray-400 text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-1 w-16">Code</th>
              <th className="border border-gray-400 p-1">Course</th>
              <th className="border border-gray-400 p-1 w-16">Grade</th>
              <th className="border border-gray-400 p-1 w-12">Rem.</th>
            </tr>
          </thead>
          <tbody>
            {semester.marks.map((m, mIndex) => (
              <tr key={mIndex}>
                <td className="border border-gray-400 p-1 h-5">
                  {isEditing ? <input className="w-full outline-none" value={m.code} onChange={e => handleSemesterMarkChange(semIndex, mIndex, 'code', e.target.value)}/> : m.code}
                </td>
                <td className="border border-gray-400 p-1 h-5">
                  {isEditing ? <input className="w-full outline-none" value={m.subject} onChange={e => handleSemesterMarkChange(semIndex, mIndex, 'subject', e.target.value)}/> : m.subject}
                </td>
                <td className="border border-gray-400 p-1 text-center font-bold">
                  {isEditing ? <input className="w-full text-center outline-none" value={m.grade} onChange={e => handleSemesterMarkChange(semIndex, mIndex, 'grade', e.target.value)}/> : m.grade}
                </td>
                <td className="border border-gray-400 p-1"></td>
              </tr>
            ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="border border-gray-400 p-1 text-right">CGPA</td>
                <td className="border border-gray-400 p-1 text-center text-blue-700">
                  {isEditing ? <input className="w-full text-center outline-none bg-transparent" value={semester.cgpa} onChange={e => {
                      const newSems = [...profile.semesters];
                      newSems[semIndex].cgpa = e.target.value;
                      setProfile({...profile, semesters: newSems});
                    }}/> : semester.cgpa}
                </td>
                <td className="border border-gray-400 p-1"></td>
              </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderProfilePage = () => (
    <div className="p-4 flex flex-col items-center academic-font text-center space-y-6">
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold uppercase">St. Peter's College of Engineering and Technology</h2>
        <p className="text-[7px] text-gray-500 uppercase mt-0.5">{COLLEGE_ADDRESS}</p>
      </div>
      
      <div className="relative group">
        <div className="w-28 h-36 border-2 border-gray-200 shadow-md relative bg-white overflow-hidden">
          {profile.photo ? (
            <img src={profile.photo} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-gray-300">PHOTO</div>
          )}
        </div>
        {isEditing && (
          <button 
            onClick={() => photoInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
          >
            <Camera className="w-6 h-6" />
            <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </button>
        )}
      </div>

      <div className="w-full space-y-3 text-left text-[11px]">
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-bold">Programme:</span> {profile.programme}</p>
          <p><span className="font-bold">Branch:</span> {profile.branch}</p>
        </div>
        <p><span className="font-bold">Name:</span> <span className="uppercase">{profile.fullName}</span></p>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-bold">Roll No:</span> {profile.rollNumber}</p>
          <p><span className="font-bold">Reg No:</span> {profile.registerNo}</p>
        </div>
        <p><span className="font-bold">Section:</span> {profile.section}</p>
      </div>
    </div>
  );

  const renderDocumentsPage = () => (
    <div className="p-4 flex flex-col h-full academic-font">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase text-blue-900 underline decoration-2 underline-offset-4">Academic Documents</h3>
        {isEditing && (
          <Button variant="primary" size="sm" onClick={() => certInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" /> Add Document
            <input type="file" ref={certInputRef} className="hidden" onChange={handleDocumentUpload} />
          </Button>
        )}
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4">
        {profile.certificates && profile.certificates.length > 0 ? (
          profile.certificates.map(doc => (
            <div key={doc.id} className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between group">
              <div className="flex items-center space-x-3 truncate">
                <div className="bg-blue-100 p-2 rounded text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold truncate pr-4">{doc.name}</p>
                  <p className="text-[8px] text-gray-400 uppercase">Academic Cert</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-white rounded text-blue-600 shadow-sm transition-all" title="Download"><Download className="w-3 h-3" /></button>
                {isEditing && (
                  <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500 shadow-sm transition-all" title="Delete"><Trash2 className="w-3 h-3" /></button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-xl text-gray-300">
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-[10px] font-medium italic">No files attached</p>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) {
    return <BookCover profile={profile} onOpen={() => setIsOpen(true)} role={role} />;
  }

  return (
    <div className={`relative w-full max-w-6xl animate-in fade-in zoom-in duration-700 perspective-2000 ${isTurning ? 'is-turning' : ''}`}>
      {/* Quick Jump Sidebar */}
      {showJumpMenu && (
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur shadow-2xl z-[150] p-6 animate-in slide-in-from-right duration-300 rounded-l-2xl border-l">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-blue-900">Go To Page</h3>
            <button onClick={() => setShowJumpMenu(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-2">
            <button onClick={() => jumpToPage(0)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 0 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">1. PROFILE & PERSONAL</span>
            </button>
            <button onClick={() => jumpToPage(1)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 1 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">2. SEMESTER 1 & 2</span>
            </button>
            <button onClick={() => jumpToPage(2)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 2 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">3. SEMESTER 3 & 4</span>
            </button>
            <button onClick={() => jumpToPage(3)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 3 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">4. SEMESTER 5 & 6</span>
            </button>
            <button onClick={() => jumpToPage(4)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 4 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">5. SEMESTER 7 & 8</span>
            </button>
            <button onClick={() => jumpToPage(5)} className={`w-full text-left p-3 rounded-xl transition-all ${currentPage === 5 ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-100'}`}>
              <span className="text-xs font-bold">6. DOCUMENTS</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute -top-14 left-0 right-0 flex justify-between items-center z-[100]">
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-md bg-white/80" onClick={onClose || (() => setIsOpen(false))}>
            <X className="w-4 h-4 mr-2" /> Exit Book
          </Button>
          <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-md bg-white/80" onClick={() => setShowJumpMenu(true)}>
            <LayoutGrid className="w-4 h-4 mr-2" /> Go To...
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          {canEdit && (
            isEditing ? (
              <>
                <Button variant="primary" size="sm" className="shadow-lg" onClick={handleUpdate}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                <Button variant="outline" size="sm" className="shadow-lg bg-white" onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="primary" size="sm" className="shadow-lg" onClick={() => setIsEditing(true)}><Edit3 className="w-4 h-4 mr-2" /> Edit Record</Button>
            )
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[780px] book-shadow rounded-sm overflow-hidden bg-white relative">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 z-[70] opacity-40"></div>

        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[90] pointer-events-none">
          <button 
            onClick={() => handlePageTurn('prev')}
            className={`pointer-events-auto flex items-center space-x-2 pl-2 pr-4 py-4 rounded-r-full bg-white/95 shadow-2xl border border-gray-100 text-gray-800 hover:translate-x-1 transition-all group ${currentPage === 0 || isTurning ? 'opacity-0 -translate-x-full' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-125 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Previous</span>
          </button>
          <button 
            onClick={() => handlePageTurn('next')}
            className={`pointer-events-auto flex items-center space-x-2 pr-2 pl-4 py-4 rounded-l-full bg-white/95 shadow-2xl border border-gray-100 text-gray-800 hover:-translate-x-1 transition-all group ${currentPage === maxPages || isTurning ? 'opacity-0 translate-x-full' : 'opacity-100'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Go To Next</span>
            <ChevronRight className="w-6 h-6 group-hover:scale-125 transition-transform" />
          </button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-1 relative h-full">
           <div className="flex-1">
              {currentPage === 0 && <PageWrapper pageNumber={1} side="left">{renderProfilePage()}</PageWrapper>}
              {currentPage === 1 && <PageWrapper pageNumber={3} title="SEMESTER MARKS (1 & 2)" side="left">{renderSemesterMarks(0)}{renderSemesterMarks(1)}</PageWrapper>}
              {currentPage === 2 && <PageWrapper pageNumber={5} title="SEMESTER MARKS (3 & 4)" side="left">{renderSemesterMarks(2)}{renderSemesterMarks(3)}</PageWrapper>}
              {currentPage === 3 && <PageWrapper pageNumber={7} title="SEMESTER MARKS (5 & 6)" side="left">{renderSemesterMarks(4)}{renderSemesterMarks(5)}</PageWrapper>}
              {currentPage === 4 && <PageWrapper pageNumber={9} title="SEMESTER MARKS (7 & 8)" side="left">{renderSemesterMarks(6)}{renderSemesterMarks(7)}</PageWrapper>}
              {currentPage === 5 && <PageWrapper pageNumber={11} title="DOCUMENT REPOSITORY" side="left">{renderDocumentsPage()}</PageWrapper>}
           </div>

           <div className="flex-1">
              {currentPage === 0 && <PageWrapper pageNumber={2} title="PERSONAL DETAILS" side="right">{renderPersonalDetailsPage()}</PageWrapper>}
              {currentPage === 1 && <div className="h-full bg-gray-50 flex items-center justify-center border-l"><p className="text-gray-300 italic academic-font">1st Year Summary</p></div>}
              {currentPage === 2 && <div className="h-full bg-gray-50 flex items-center justify-center border-l"><p className="text-gray-300 italic academic-font">2nd Year Summary</p></div>}
              {currentPage === 3 && <div className="h-full bg-gray-50 flex items-center justify-center border-l"><p className="text-gray-300 italic academic-font">3rd Year Summary</p></div>}
              {currentPage === 4 && <div className="h-full bg-gray-50 flex items-center justify-center border-l"><p className="text-gray-300 italic academic-font">Final Year Summary</p></div>}
              {currentPage === 5 && (
                <div className="h-full bg-gray-50 paper-texture flex items-center justify-center border-l border-gray-300">
                  <div className="text-center opacity-30 select-none">
                    <h4 className="text-xl font-bold uppercase tracking-widest text-gray-700">{COLLEGE_NAME}</h4>
                    <p className="mt-2 academic-font text-sm italic">Academic Record Book End</p>
                  </div>
                </div>
              )}
           </div>

           {isTurning && (
             <div className={`absolute inset-0 z-[80] flex pointer-events-none`}>
               {isTurning === 'next' ? (
                 <>
                   <div className="flex-1"></div>
                   <div className="flex-1 turning-right shadow-2xl">
                     <PageWrapper pageNumber={currentPage * 2 + 2} side="left" title="LOADING..."><div className="opacity-0">HIDDEN</div></PageWrapper>
                     <div className="page-curl-shadow shadow-right"></div>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex-1 turning-left shadow-2xl">
                     <PageWrapper pageNumber={currentPage * 2 + 1} side="right" title="LOADING..."><div className="opacity-0">HIDDEN</div></PageWrapper>
                     <div className="page-curl-shadow shadow-left"></div>
                   </div>
                   <div className="flex-1"></div>
                 </>
               )}
             </div>
           )}
        </div>

        {/* Mobile View */}
        <div className="flex md:hidden flex-1 overflow-y-auto">
           {currentPage === 0 && <PageWrapper pageNumber={1} side="left">{renderProfilePage()}{renderPersonalDetailsPage()}</PageWrapper>}
           {currentPage >= 1 && currentPage <= 4 && <PageWrapper pageNumber={currentPage+1} title={`SEMESTERS`} side="left">{renderSemesterMarks((currentPage-1)*2)}{renderSemesterMarks((currentPage-1)*2+1)}</PageWrapper>}
           {currentPage === 5 && renderDocumentsPage()}
        </div>
      </div>

      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: maxPages + 1 }).map((_, i) => (
          <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-300 ${currentPage === i ? 'bg-blue-600 scale-x-125' : 'bg-gray-300'}`}></div>
        ))}
      </div>
    </div>
  );
};
