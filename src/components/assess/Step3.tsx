import React, { useState } from 'react';
import { AssessmentData, Attendee } from '@/lib/types';
import { UserPlus, Trash2, ShieldCheck, UserCircle } from 'lucide-react';

interface Step3Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onSubmit: () => void;
}

export default function Step3({ data, updateData }: Step3Props) {
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');

    const addAttendee = () => {
        if (!newName) return;
        const newAttendee: Attendee = {
            id: crypto.randomUUID(),
            name: newName,
            role: newRole || 'Participant',
            isDRI: data.attendees?.length === 0, // First one is DRI by default
            isOptional: false,
        };
        updateData({ attendees: [...(data.attendees || []), newAttendee] });
        setNewName('');
        setNewRole('');
    };

    const removeAttendee = (id: string) => {
        updateData({ attendees: data.attendees?.filter(a => a.id !== id) });
    };

    const toggleStatus = (id: string, field: 'isDRI' | 'isOptional') => {
        updateData({
            attendees: data.attendees?.map(a =>
                a.id === id ? { ...a, [field]: !a[field] } : a
            )
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Who's attending?</h2>
                <p className="text-slate-500">Add the people involved. Don't forget to mark the Meeting Leader (Directly Responsible Individual).</p>
            </div>

            <div className="space-y-6">
                {/* Add Attendee Form */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Name"
                        className="flex-1 p-3 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <input
                        type="text"
                        placeholder="Job Title (optional)"
                        className="sm:w-1/3 p-3 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <button
                        onClick={addAttendee}
                        className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>

                {/* Attendee List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {data.attendees?.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                            <UserCircle className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400">No attendees added yet.</p>
                        </div>
                    ) : (
                        data.attendees?.map((attendee) => (
                            <div key={attendee.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">{attendee.name}</div>
                                    <div className="text-xs text-slate-500">{attendee.role || 'Participant'}</div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        className={`flex-1 sm:flex-none p-2 rounded-lg border-2 font-medium text-sm focus:outline-none transition-colors ${attendee.isDRI
                                                ? 'border-orange-200 bg-orange-50 text-orange-700'
                                                : attendee.isOptional
                                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-white text-slate-700'
                                            }`}
                                        value={attendee.isDRI ? 'LEADER' : attendee.isOptional ? 'OPTIONAL' : 'REQUIRED'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateData({
                                                attendees: data.attendees?.map(a => {
                                                    if (a.id !== attendee.id) return a;
                                                    if (val === 'LEADER') return { ...a, isDRI: true, isOptional: false };
                                                    if (val === 'OPTIONAL') return { ...a, isDRI: false, isOptional: true };
                                                    return { ...a, isDRI: false, isOptional: false };
                                                })
                                            });
                                        }}
                                    >
                                        <option value="LEADER">Leader (DRI)</option>
                                        <option value="REQUIRED">Required</option>
                                        <option value="OPTIONAL">Optional</option>
                                    </select>

                                    <button
                                        onClick={() => removeAttendee(attendee.id)}
                                        title="Remove attendee"
                                        aria-label="Remove attendee"
                                        className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 text-slate-400 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
