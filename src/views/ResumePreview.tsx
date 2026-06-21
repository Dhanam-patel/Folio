import { useState, useRef } from 'react';
import { Download, ToggleLeft, ToggleRight, GripVertical, FileText, Plus, Trash2, Briefcase, ChevronDown } from 'lucide-react';
import { useProfile, useSectionConfig } from '../context/ProfileContext';
import { SectionKey, SECTION_LABELS } from '../types/resume';
import { HarvardResume } from './resume/HarvardResume';

export function ResumePreview() {
  const { profile, currentResume, setCurrentResume, resumes, deleteResume } = useProfile();
  const { toggleSection, reorderSections } = useSectionConfig();
  const printRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<SectionKey | null>(null);
  const [dragOver, setDragOver] = useState<SectionKey | null>(null);
  const [showResumeList, setShowResumeList] = useState(false);

  const visibleSections = currentResume.sectionOrder.filter(
    s => !currentResume.hiddenSections.includes(s)
  );

  const handleDragStart = (key: SectionKey) => setDragging(key);
  const handleDragOver = (e: React.DragEvent, key: SectionKey) => { e.preventDefault(); setDragOver(key); };
  const handleDrop = (targetKey: SectionKey) => {
    if (!dragging || dragging === targetKey) { setDragging(null); setDragOver(null); return; }
    const order = [...currentResume.sectionOrder];
    const fromIdx = order.indexOf(dragging);
    const toIdx = order.indexOf(targetKey);
    order.splice(fromIdx, 1);
    order.splice(toIdx, 0, dragging);
    reorderSections(order);
    setDragging(null); setDragOver(null);
  };

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin:       0,
        filename:     `${profile.personal.name ? profile.personal.name.replace(/\s+/g, '_') : 'resume'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(printRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f0f4ff]">
      {/* Section controls */}
      <div className="w-52 bg-white border-r border-dark-200/50 flex-shrink-0 flex flex-col">
        {/* Resume Selector */}
        <div className="p-4 border-b border-dark-200/30">
          <div className="relative">
            <button
              onClick={() => setShowResumeList(!showResumeList)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-dark-50 hover:bg-dark-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-brand-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-dark-900 truncate">
                  {currentResume.name}
                </span>
              </div>
              <ChevronDown size={14} className={`text-dark-700/40 flex-shrink-0 transition-transform ${showResumeList ? 'rotate-180' : ''}`} />
            </button>

            {showResumeList && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dark-200/50 rounded-xl shadow-card-lg z-50 max-h-64 overflow-y-auto">
                {resumes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentResume(r);
                      setShowResumeList(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-dark-50 transition-colors ${
                      currentResume.id === r.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <Briefcase size={12} className={currentResume.id === r.id ? 'text-brand-500' : 'text-dark-700/40'} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-dark-900 truncate">{r.name}</p>
                      {r.jobDescription && (
                        <p className="text-[10px] text-dark-700/40 truncate">
                          {r.jobDescription.split('\n')[0].slice(0, 30)}...
                        </p>
                      )}
                    </div>
                    {resumes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteResume(r.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                        title="Delete resume"
                      >
                        <Trash2 size={12} className="text-red-400 hover:text-red-500" />
                      </button>
                    )}
                  </button>
                ))}
                <div className="border-t border-dark-200/30 p-2">
                  <p className="text-[10px] text-dark-700/50 text-center">
                    {resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-dark-200/30">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-brand-500" />
            <h3 className="text-xs font-bold text-dark-900 uppercase tracking-wide">Sections</h3>
          </div>
          <p className="text-[10px] text-dark-700/50 mt-1">Drag to reorder · toggle on/off</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {currentResume.sectionOrder.map(key => {
            const isHidden = currentResume.hiddenSections.includes(key);
            const isDragOver = dragOver === key;

            return (
              <div
                key={key}
                draggable
                onDragStart={() => handleDragStart(key)}
                onDragOver={e => handleDragOver(e, key)}
                onDrop={() => handleDrop(key)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-move transition-all group ${
                  isDragOver ? 'border-2 border-brand-400 bg-brand-50' :
                  dragging === key ? 'opacity-40' :
                  'border border-transparent hover:border-dark-200/50 hover:bg-dark-50'
                } ${isHidden ? 'opacity-40' : ''}`}
              >
                <GripVertical size={11} className="text-dark-700/30 flex-shrink-0" />
                <span className={`flex-1 text-xs font-medium truncate ${isHidden ? 'text-dark-700/30' : 'text-dark-700'}`}>
                  {SECTION_LABELS[key]}
                </span>
                <button
                  onClick={() => toggleSection(key)}
                  className={`flex-shrink-0 transition-colors ${isHidden ? 'text-dark-700/20 hover:text-dark-700/50' : 'text-brand-500 hover:text-brand-700'}`}
                >
                  {isHidden ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-dark-200/30 space-y-2">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-900 text-white text-xs font-bold rounded-xl hover:bg-dark-800 transition-colors"
          >
            <Download size={13} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume canvas */}
      <div className="flex-1 overflow-y-auto bg-dark-100/50">
        <div className="py-8 flex justify-center min-h-full">
          <div ref={printRef} className="print-area drop-shadow-xl">
            <HarvardResume profile={profile} sectionOrder={visibleSections} />
          </div>
        </div>
      </div>
    </div>
  );
}
