import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MessageSquare, CheckSquare, Plus, Trash2, AlertCircle } from 'lucide-react';

export const Column4Overplanned: React.FC = () => {
  const {
    activeMember,
    activeMeeting,
    updateOverplannedDiscussion,
    addOverplannedAction,
    toggleOverplannedAction,
    deleteOverplannedAction,
    addOverplannedDepartmentAction,
    deleteOverplannedDepartmentAction,
    setOverplannedNoAction, setOverplannedDepartmentsNoAction,
  } = useDashboard();

  const [newActionText, setNewActionText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Operation');
  const [departmentDueDate, setDepartmentDueDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const discussion = activeMeeting.overplannedNegotiation?.discussionNotes || '';
  const actions = activeMeeting.overplannedNegotiation?.actions || [];
  const departments = activeMeeting.overplannedNegotiation?.departmentsActions || [];
  const noDepartmentActions = activeMeeting.overplannedNegotiation?.departmentsNoAction || false;
  const noAction = activeMeeting.overplannedNegotiation?.noAction || false;
  const departmentOptions = ['Operation', 'Data Entry', 'Video Edit', 'Technical'];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    addOverplannedAction(newActionText, newDueDate);
    setNewActionText('');
  };

  const pendingCount = actions.filter((a) => !a.done).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Rose / Crimson Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            4
          </span>
          <h2 className="text-xs font-bold tracking-wide">Overplanned Negotiation</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans truncate">
          Overplanned Hours Analysis & Negotiation Actions
        </span>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* Quality Discussion */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>1. Quality Discussion:</span>
            </span>
            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              Auto-saved
            </span>
          </label>
          <textarea
            rows={5}
            value={discussion}
            onChange={(e) => updateOverplannedDiscussion(e.target.value)}
            placeholder="Enter the quality discussion about overplanned hours and the agreed outcome..."
            className="w-full text-xs text-slate-800 p-2.5 bg-rose-50/30 border border-rose-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed resize-none shadow-2xs"
          />
        </div>

        {/* Quality Actions */}
        <div className="space-y-2 pt-2 border-t border-rose-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>2. Quality Actions:</span>
            </label>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-mono font-bold border border-rose-200">
              {pendingCount} pending
            </span>
          </div>

          {/* Add Action Form */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={noAction} onChange={(e) => setOverplannedNoAction(e.target.checked)} className="rounded" /> لا يوجد — لن يتم اتخاذ أي Action</label>
          {!noAction && <form onSubmit={handleAddAction} className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200 space-y-2">
            <input
              type="text"
              required
              placeholder="Enter the required quality action..."
              value={newActionText}
              disabled={noAction}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-700 focus:outline-none flex-1"
                title="تاريخ الاستحقاق"
              />
              <button
                type="submit"
                disabled={noAction}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Action</span>
              </button>
            </div>
          </form>}

          {/* Action Items List */}
          <div className="space-y-1.5">
            {actions.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No actions recorded for this meeting yet.
              </div>
            ) : (
              actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    act.done
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-rose-200 shadow-2xs hover:border-rose-300'
                  }`}
                >
                  <label className="flex items-start gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() => toggleOverplannedAction(act.id)}
                      className="w-3.5 h-3.5 text-rose-600 rounded mt-0.5 focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`block font-medium ${
                          act.done ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {act.text}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        {act.dueDate && <span>Due: {act.dueDate}</span>}
                        {act.createdBy && (
                          <span className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-sans">
                            {act.createdBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>

                  <button
                    onClick={() => deleteOverplannedAction(act.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Delete action"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-800">Departments Actions</div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={noDepartmentActions} onChange={(event) => setOverplannedDepartmentsNoAction(event.target.checked)} className="rounded" /> لا يوجد Department Actions</label>
          {!noDepartmentActions && <>
                    <form onSubmit={(event) => { event.preventDefault(); addOverplannedDepartmentAction(selectedDepartment, departmentDueDate); }} className="space-y-2 rounded-lg border border-rose-200 bg-rose-50/50 p-2">
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs">{departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}</select>
            <div className="flex items-center gap-2"><input required type="date" value={departmentDueDate} onChange={(event) => setDepartmentDueDate(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs" /><button type="submit" className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white"><Plus className="inline h-3 w-3" /> Add Action</button></div>
          </form>
          <div className="space-y-1.5">{departments.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border bg-white p-2 text-[11px]"><span className="font-semibold">{item.department}</span><span>Due: {item.dueDate || '-'}</span><button type="button" onClick={() => deleteOverplannedDepartmentAction(item.id)} className="text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>
          </>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-rose-50/50 border-t border-rose-100 text-[10px] text-rose-900 text-center font-mono shrink-0">
        {actions.length} Actions Logged
      </div>
    </div>
  );
};
