import React, { useState } from 'react';
import { AssessmentData, Attendee } from '@/lib/types';
import { UserPlus, Trash2, ShieldCheck, UserCircle } from 'lucide-react';
import { useEOS } from '@/contexts/EOSContext';

interface Step3Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onSubmit: () => void;
}

export default function Step3({ data, updateData }: Step3Props) {
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const { eosMode } = useEOS();

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
                <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                    {eosMode ? 'Who needs to be there?' : "Who's attending?"}
                </h2>
                <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                    {eosMode
                        ? 'More people = more cost. Add only those who must be present.'
                        : "Add the people involved. Don't forget to mark the Meeting Leader (Directly Responsible Individual)."}
                </p>
            </div>

            <div className="space-y-6">
                {/* Add Attendee Form */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Name"
                        className={`flex-1 p-3 rounded-xl border-2 focus:outline-none ${
                            eosMode
                                ? 'border-neutral-700 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-amber-500'
                                : 'border-slate-100 focus:border-score-teal'
                        }`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <input
                        type="text"
                        placeholder="Job Title (optional)"
                        className={`sm:w-1/3 p-3 rounded-xl border-2 focus:outline-none ${
                            eosMode
                                ? 'border-neutral-700 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-amber-500'
                                : 'border-slate-100 focus:border-score-teal'
                        }`}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <button
                        onClick={addAttendee}
                        className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold ${
                            eosMode
                                ? 'bg-amber-500 text-black hover:bg-amber-400'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>

                {/* Attendee List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {data.attendees?.length === 0 ? (
                        <div className={`text-center py-10 border-2 border-dashed rounded-2xl ${
                            eosMode ? 'border-neutral-700' : 'border-slate-100'
                        }`}>
                            <UserCircle className={`w-12 h-12 mx-auto mb-2 ${eosMode ? 'text-neutral-600' : 'text-slate-200'}`} />
                            <p className={eosMode ? 'text-neutral-500' : 'text-slate-400'}>No attendees added yet.</p>
                        </div>
                    ) : (
                        data.attendees?.map((attendee) => (
                            <div key={attendee.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border group ${
                                eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-100'
                            }`}>
                                <div className="flex-1">
                                    <div className={`font-bold ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>{attendee.name}</div>
                                    <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{attendee.role || 'Participant'}</div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        className={`flex-1 sm:flex-none p-2 rounded-lg border-2 font-medium text-sm focus:outline-none transition-colors ${
                                            attendee.isDRI
                                                ? eosMode
                                                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                                                    : 'border-orange-200 bg-orange-50 text-orange-700'
                                                : attendee.isOptional
                                                    ? eosMode
                                                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                                                        : 'border-blue-200 bg-blue-50 text-blue-700'
                                                    : eosMode
                                                        ? 'border-neutral-600 bg-neutral-700 text-neutral-300'
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
                                        className={`p-2 rounded-lg transition-all ${
                                            eosMode
                                                ? 'text-neutral-500 hover:bg-red-500/20 hover:text-red-400'
                                                : 'text-slate-400 hover:bg-red-100 hover:text-red-600'
                                        }`}
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
