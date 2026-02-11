import React, { useState, useEffect } from 'react';
import { AssessmentData, Attendee } from '@/lib/types';
import { UserPlus, Trash2, UserCircle, Users, X } from 'lucide-react';
import { useEOS } from '@/contexts/EOSContext';

interface Step3Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onSubmit: () => void;
}

interface SavedContact {
    name: string;
    role: string;
}

const CONTACTS_KEY = 'skip-score-contacts';

export default function Step3({ data, updateData }: Step3Props) {
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
    const { eosMode } = useEOS();

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CONTACTS_KEY);
            if (stored) {
                setSavedContacts(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const saveContact = (name: string, role: string) => {
        let stored: SavedContact[] = [];
        try {
            stored = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
        } catch {
            stored = [];
        }
        const existingIdx = stored.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
        if (existingIdx >= 0) {
            stored[existingIdx].role = role;
        } else {
            stored.push({ name, role });
        }
        stored.sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(stored));
        setSavedContacts(stored);
    };

    const removeSavedContact = (name: string) => {
        let stored: SavedContact[] = [];
        try {
            stored = JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
        } catch {
            stored = [];
        }
        stored = stored.filter(c => c.name.toLowerCase() !== name.toLowerCase());
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(stored));
        setSavedContacts(stored);
    };

    const addAttendee = () => {
        if (!newName) return;
        const role = newRole || 'Participant';
        const newAttendee: Attendee = {
            id: crypto.randomUUID(),
            name: newName,
            role,
            isDRI: data.attendees?.length === 0,
            isOptional: false,
        };
        updateData({ attendees: [...(data.attendees || []), newAttendee] });
        saveContact(newName, role);
        setNewName('');
        setNewRole('');
    };

    const removeAttendee = (id: string) => {
        updateData({ attendees: data.attendees?.filter(a => a.id !== id) });
    };

    const isContactInMeeting = (contact: SavedContact) => {
        return (data.attendees || []).some(a => a.name.toLowerCase() === contact.name.toLowerCase());
    };

    const toggleSavedContact = (contact: SavedContact) => {
        const current = data.attendees || [];
        const existing = current.find(a => a.name.toLowerCase() === contact.name.toLowerCase());
        if (existing) {
            updateData({ attendees: current.filter(a => a.id !== existing.id) });
        } else {
            const newAttendee: Attendee = {
                id: crypto.randomUUID(),
                name: contact.name,
                role: contact.role,
                isDRI: current.length === 0,
                isOptional: false,
            };
            updateData({ attendees: [...current, newAttendee] });
        }
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
                {/* Saved Contacts Quick-Select */}
                {savedContacts.length > 0 && (
                    <div className="space-y-3">
                        <label className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                            <Users className={`w-4 h-4 ${eosMode ? 'text-amber-500' : 'text-slate-500'}`} />
                            Your Team
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {savedContacts.map((contact) => {
                                const inMeeting = isContactInMeeting(contact);
                                return (
                                    <div key={contact.name} className="group relative">
                                        <button
                                            onClick={() => toggleSavedContact(contact)}
                                            className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                                                inMeeting
                                                    ? eosMode
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                                        : 'border-score-teal bg-teal-50 text-score-teal'
                                                    : eosMode
                                                        ? 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200'
                                                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
                                                inMeeting
                                                    ? eosMode
                                                        ? 'border-amber-500 bg-amber-500 text-black'
                                                        : 'border-score-teal bg-score-teal text-white'
                                                    : eosMode
                                                        ? 'border-neutral-600'
                                                        : 'border-slate-300'
                                            }`}>
                                                {inMeeting && '✓'}
                                            </span>
                                            {contact.name}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeSavedContact(contact.name);
                                                // Also remove from current meeting if present
                                                if (inMeeting) {
                                                    const existing = (data.attendees || []).find(a => a.name.toLowerCase() === contact.name.toLowerCase());
                                                    if (existing) {
                                                        updateData({ attendees: data.attendees?.filter(a => a.id !== existing.id) });
                                                    }
                                                }
                                            }}
                                            className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                                                eosMode
                                                    ? 'bg-neutral-700 text-neutral-400 hover:bg-red-500/30 hover:text-red-400'
                                                    : 'bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500'
                                            }`}
                                            title="Remove from saved contacts"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add Attendee Form */}
                <div className="space-y-2">
                    {savedContacts.length > 0 && (
                        <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                            Add Someone New
                        </label>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Name"
                            className={`flex-1 p-3 rounded-xl border-2 focus:outline-none ${
                                eosMode
                                    ? 'border-neutral-700 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-amber-500'
                                    : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
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
                                    : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
                            }`}
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                        />
                        <button
                            onClick={addAttendee}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold cursor-pointer ${
                                eosMode
                                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Attendee List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {data.attendees?.length === 0 ? (
                        <div className={`text-center py-10 border-2 border-dashed rounded-2xl ${
                            eosMode ? 'border-neutral-700' : 'border-slate-200'
                        }`}>
                            <UserCircle className={`w-12 h-12 mx-auto mb-2 ${eosMode ? 'text-neutral-600' : 'text-slate-200'}`} />
                            <p className={eosMode ? 'text-neutral-500' : 'text-slate-400'}>
                                {savedContacts.length > 0
                                    ? 'Select team members above or add someone new.'
                                    : 'No attendees added yet.'}
                            </p>
                        </div>
                    ) : (
                        data.attendees?.map((attendee) => (
                            <div key={attendee.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border group ${
                                eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-200'
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
                                        className={`p-2 rounded-lg transition-all cursor-pointer ${
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
