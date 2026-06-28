
import { StudentProfile, UserRole } from '../../types';
import { COLLEGE_NAME, COLLEGE_ADDRESS, COLLEGE_BUILDING_IMG, LITE_BLUE_HEX } from '../../constants';

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: string | number): any;
  export function jsxs(type: any, props: any, key?: string | number): any;
  export function jsxDEV(type: any, props: any, key?: string | number, source?: any, self?: any): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface BookCoverProps {
  profile: StudentProfile;
  onOpen: () => void;
  role: UserRole;
}

export const BookCover = ({ profile, onOpen, role }: BookCoverProps) => {
  return (
    <div 
      onClick={onOpen}
      className="cursor-pointer group relative w-full h-[700px] md:w-[500px] rounded-r-2xl shadow-[20px_0px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 transform hover:scale-[1.02] perspective-1000 overflow-hidden"
      style={{ backgroundColor: LITE_BLUE_HEX }}
    >
      {/* Spine effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-blue-600/20 border-r border-black/10 z-10 shadow-lg"></div>

      <div className="relative z-20 h-full flex flex-col p-10 text-center academic-font">
        {/* Top Header - Logo Removed as requested */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-red-700 leading-tight">
            {COLLEGE_NAME}
          </h2>
          <p className="text-[10px] text-gray-600 mt-1">
            Approved by AICTE, New Delhi and Affiliated to Anna University Chennai<br/>
            {COLLEGE_ADDRESS}
          </p>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-red-700 italic tracking-wider drop-shadow-sm">
            STUDENT PROFILE
          </h1>
        </div>

        {/* Building Image Block - Updated to match user's building */}
        <div className="relative w-full h-56 mb-8 border-4 border-white shadow-2xl rounded-sm overflow-hidden bg-white">
          <img 
            src={COLLEGE_BUILDING_IMG} 
            alt="College Building" 
            className="w-full h-full object-cover grayscale-[10%]" 
          />
        </div>

        {/* Student Info Block */}
        <div className="mt-auto flex justify-end">
          <div className="bg-white/95 p-5 rounded-lg border-l-8 border-red-700 text-left w-full shadow-xl">
             <div className="flex items-start space-x-4">
                {profile.photo && (
                  <img src={profile.photo} className="w-20 h-24 object-cover border" />
                ) || (
                   <div className="w-20 h-24 bg-gray-200 border flex items-center justify-center text-[10px] text-gray-400">PHOTO</div>
                )}
                <div className="flex-1 text-[11px] space-y-1.5 text-blue-900 font-bold uppercase">
                   <p><span className="text-gray-500 w-20 inline-block font-normal">NAME:</span> {profile.fullName}</p>
                   <p><span className="text-gray-500 w-20 inline-block font-normal">REG NO:</span> {profile.registerNo}</p>
                   <p><span className="text-gray-500 w-20 inline-block font-normal">DEGREE:</span> {profile.programme}</p>
                   <p><span className="text-gray-500 w-20 inline-block font-normal">BRANCH:</span> {profile.branch}</p>
                   <p><span className="text-gray-500 w-20 inline-block font-normal">A.Y:</span> {profile.academicYear}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-blue-900 font-bold italic animate-pulse">
          Click to Open Record Book
        </div>
      </div>
    </div>
  );
};
