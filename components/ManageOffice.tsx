import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import type { Room, Electronics, RoomElectronicsMap } from '../types';
import { ElectronicsType } from '../types';
import { Plus, Edit2, Trash2, Check, X, Search, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ManageOfficeProps {
  refreshLayout: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

// ─── Shared Styles ──────────────────────────────────────────
const inputClass = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-500";
const selectClass = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none";
const btnPrimary = "flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow text-sm active:scale-95";
const btnDanger = "p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all";
const btnEdit = "p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all";
const btnSuccess = "p-2 rounded-lg text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-all";
const btnCancel = "p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all";
const thClass = "px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-700";
const tdClass = "px-6 py-4 text-sm text-slate-300 whitespace-nowrap border-b border-slate-700 group-hover:bg-slate-700/30 transition-colors";

const generateKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// ─── Rooms Table ────────────────────────────────────────────
const RoomsTable: FC<{ onDataChange: () => void }> = ({ onDataChange }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      setRooms(await res.json());
    } catch (e) { console.error('Failed to fetch rooms:', e); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const roomKey = generateKey(newName);
    await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: newName, room_key: roomKey }),
    });
    setNewName(''); setIsAdding(false);
    fetchRooms(); onDataChange();
  };

  const handleEdit = async (roomId: string) => {
    await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: editName, room_key: editKey }),
    });
    setEditingId(null);
    fetchRooms(); onDataChange();
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Delete this room? All mappings will be removed.')) return;
    await fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: 'DELETE' });
    fetchRooms(); onDataChange();
  };

  const startEdit = (room: Room) => {
    setEditingId(room.room_id);
    setEditName(room.room_name);
    setEditKey(room.room_key);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 bg-slate-800">
        <div>
            <h3 className="text-lg font-bold text-slate-100">Rooms</h3>
            <p className="text-sm text-slate-400">Manage office spaces</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Room
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex items-center gap-4 p-4 bg-slate-700/30 border-b border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1">
             <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Room Name e.g. 'Conference Room'" className={inputClass} autoFocus />
          </div>
          <div className="text-sm text-slate-400 font-mono self-center min-w-[120px] px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
            {newName ? generateKey(newName) : 'auto-key'}
          </div>
          <div className="flex items-center gap-1">
              <button type="submit" className={btnSuccess} title="Save"><Check size={18} /></button>
              <button type="button" onClick={() => setIsAdding(false)} className={btnCancel} title="Cancel"><X size={18} /></button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Room Name</th>
              <th className={thClass}>Key</th>
              <th className={thClass}>ID</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800">
            {rooms.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No rooms found. Create one to get started.</td></tr>
            )}
            {rooms.map(room => (
              <tr key={room._id} className="group">
                {editingId === room.room_id ? (
                  <>
                    <td className={tdClass}><input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} /></td>
                    <td className={tdClass}><input value={editKey} disabled className={`${inputClass} bg-slate-700 text-slate-500 cursor-not-allowed`} /></td>
                    <td className={`${tdClass} text-slate-500 font-mono text-xs`}>{room.room_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(room.room_id)} className={btnSuccess} title="Save"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className={btnCancel} title="Cancel"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={tdClass}><span className="font-semibold text-slate-200">{room.room_name}</span></td>
                    <td className={tdClass}><span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-mono text-slate-400 border border-slate-600">{room.room_key}</span></td>
                    <td className={`${tdClass} text-slate-500 font-mono text-xs`}>{room.room_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(room)} className={btnEdit} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(room.room_id)} className={btnDanger} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Electronics Table ──────────────────────────────────────
const ElectronicsTable: FC<{ onDataChange: () => void }> = ({ onDataChange }) => {
  const [electronics, setElectronics] = useState<Electronics[]>([]);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ElectronicsType>(ElectronicsType.LIGHT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editType, setEditType] = useState<ElectronicsType>(ElectronicsType.LIGHT);
  const [isAdding, setIsAdding] = useState(false);

  const fetchElectronics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/electronics`);
      setElectronics(await res.json());
    } catch (e) { console.error('Failed to fetch electronics:', e); }
  }, []);

  useEffect(() => { fetchElectronics(); }, [fetchElectronics]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const electronicsKey = generateKey(newName);
    await fetch(`${API_BASE_URL}/electronics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ electronics_name: newName, electronics_key: electronicsKey, type: newType }),
    });
    setNewName(''); setNewType(ElectronicsType.LIGHT); setIsAdding(false);
    fetchElectronics(); onDataChange();
  };

  const handleEdit = async (electronicsId: string) => {
    await fetch(`${API_BASE_URL}/electronics/${electronicsId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ electronics_name: editName, electronics_key: editKey, type: editType }),
    });
    setEditingId(null);
    fetchElectronics(); onDataChange();
  };

  const handleDelete = async (electronicsId: string) => {
    if (!confirm('Delete this electronic? all mappings will be removed.')) return;
    await fetch(`${API_BASE_URL}/electronics/${electronicsId}`, { method: 'DELETE' });
    fetchElectronics(); onDataChange();
  };

  const startEdit = (el: Electronics) => {
    setEditingId(el.electronics_id);
    setEditName(el.electronics_name);
    setEditKey(el.electronics_key);
    setEditType(el.type);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
       <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 bg-slate-800">
        <div>
            <h3 className="text-lg font-bold text-slate-100">Electronics</h3>
            <p className="text-sm text-slate-400">Manage devices and equipment</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Device
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex items-center gap-4 p-4 bg-slate-700/30 border-b border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex-[2]">
             <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Device Name" className={inputClass} autoFocus />
           </div>
           <div className="flex-1">
             <div className="text-sm text-slate-400 font-mono px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                {newName ? generateKey(newName) : 'auto-key'}
             </div>
           </div>
           <div className="flex-1">
             <select value={newType} onChange={e => setNewType(e.target.value as ElectronicsType)} className={selectClass}>
                {Object.values(ElectronicsType).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
           </div>
           <div className="flex items-center gap-1">
              <button type="submit" className={btnSuccess} title="Save"><Check size={18} /></button>
              <button type="button" onClick={() => setIsAdding(false)} className={btnCancel} title="Cancel"><X size={18} /></button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Key</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>State</th>
              <th className={thClass}>ID</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800">
            {electronics.length === 0 && (
               <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">No electronics found. Add one to get started.</td></tr>
            )}
            {electronics.map(el => (
              <tr key={el._id} className="group">
                {editingId === el.electronics_id ? (
                  <>
                    <td className={tdClass}><input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} /></td>
                    <td className={tdClass}><input value={editKey} disabled className={`${inputClass} bg-slate-700 text-slate-500 cursor-not-allowed`} /></td>
                    <td className={tdClass}>
                      <select value={editType} onChange={e => setEditType(e.target.value as ElectronicsType)} className={selectClass}>
                        {Object.values(ElectronicsType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className={tdClass}><span className="text-slate-400 text-xs">{el.state}</span></td>
                    <td className={`${tdClass} text-slate-500 font-mono text-xs`}>{el.electronics_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(el.electronics_id)} className={btnSuccess} title="Save"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className={btnCancel} title="Cancel"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={tdClass}><span className="font-semibold text-slate-200">{el.electronics_name}</span></td>
                    <td className={tdClass}><span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-mono text-slate-400 border border-slate-600">{el.electronics_key}</span></td>
                    <td className={tdClass}>
                        <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                            el.type === 'LIGHT' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                            el.type === 'AC' && "bg-sky-500/10 text-sky-400 border-sky-500/20",
                            el.type === 'TV' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                            el.type === 'SPEAKER' && "bg-green-500/10 text-green-400 border-green-500/20",
                        )}>{el.type}</span>
                    </td>
                    <td className={tdClass}>
                        <span className={clsx(
                             "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                             el.state === 'ON' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600"
                        )}>{el.state}</span>
                    </td>
                    <td className={`${tdClass} text-slate-500 font-mono text-xs`}>{el.electronics_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(el)} className={btnEdit} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(el.electronics_id)} className={btnDanger} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Room-Electronics Map Table ─────────────────────────────
const RoomMapTable: FC<{ onDataChange: () => void }> = ({ onDataChange }) => {
  const [maps, setMaps] = useState<RoomElectronicsMap[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [electronics, setElectronics] = useState<Electronics[]>([]);
  const [mapRoomId, setMapRoomId] = useState('');
  const [mapElectronicsId, setMapElectronicsId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [mapsRes, roomsRes, electronicsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/room-electronics-map`),
        fetch(`${API_BASE_URL}/rooms`),
        fetch(`${API_BASE_URL}/electronics`),
      ]);
      setMaps(await mapsRes.json());
      setRooms(await roomsRes.json());
      setElectronics(await electronicsRes.json());
    } catch (e) { console.error('Failed to fetch map data:', e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getRoomName = (roomId: string) => rooms.find(r => r.room_id === roomId)?.room_name || roomId;
  const getElectronicsName = (elId: string) => electronics.find(e => e.electronics_id === elId)?.electronics_name || elId;

  // Filter electronics that are already mapped
  const unmappedElectronics = electronics.filter(
    el => !maps.some(m => m.electronics_id === el.electronics_id)
  );

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!mapRoomId || !mapElectronicsId) return;
    setErrorMsg('');
    const res = await fetch(`${API_BASE_URL}/room-electronics-map`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: mapRoomId, electronics_id: mapElectronicsId }),
    });

    if (!res.ok) {
      const err = await res.json();
      setErrorMsg(err.message || 'Failed to create map');
      return;
    }

    setMapRoomId(''); setMapElectronicsId(''); setIsAdding(false);
    fetchData(); onDataChange();
  };

  const handleDelete = async (mapId: string) => {
    if (!confirm('Remove this mapping?')) return;
    await fetch(`${API_BASE_URL}/room-electronics-map/${mapId}`, { method: 'DELETE' });
    fetchData(); onDataChange();
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col mb-10">
       <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700 bg-slate-800">
        <div>
            <h3 className="text-lg font-bold text-slate-100">Assignments</h3>
            <p className="text-sm text-slate-400">Map devices to rooms</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Mapping
        </button>
      </div>

      {isAdding && (
         <form onSubmit={handleAdd} className="flex flex-col gap-4 p-4 bg-slate-700/30 border-b border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-4">
             <div className="flex-1">
                 <select value={mapRoomId} onChange={e => setMapRoomId(e.target.value)} className={selectClass}>
                    <option value="">Select a Room</option>
                    {rooms.map(r => <option key={r._id} value={r.room_id}>{r.room_name}</option>)}
                </select>
             </div>
             <div className="flex-1">
                <select value={mapElectronicsId} onChange={e => setMapElectronicsId(e.target.value)} className={selectClass}>
                    <option value="">Select an Electronic</option>
                    {unmappedElectronics.map(el => <option key={el._id} value={el.electronics_id}>{el.electronics_name} ({el.electronics_id})</option>)}
                </select>
             </div>
             <div className="flex items-center gap-1 shrink-0">
                 <button type="submit" className={btnSuccess} title="Save"><Check size={18} /></button>
                 <button type="button" onClick={() => setIsAdding(false)} className={btnCancel} title="Cancel"><X size={18} /></button>
             </div>
          </div>
          {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <AlertCircle size={16} /> {errorMsg}
              </div>
          )}
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
           <thead>
            <tr>
              <th className={thClass}>Room</th>
              <th className={thClass}>Electronic</th>
              <th className={thClass}>Map ID</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800">
            {maps.length === 0 && (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No mappings found. Map a device to a room.</td></tr>
            )}
            {maps.map(m => (
              <tr key={m._id} className="group hover:bg-slate-700/30 transition-colors">
                <td className={tdClass}><span className="font-medium text-slate-300">{getRoomName(m.room_id)}</span></td>
                <td className={tdClass}><span className="font-medium text-slate-300">{getElectronicsName(m.electronics_id)}</span></td>
                <td className={`${tdClass} text-slate-500 font-mono text-xs`}>{m.room_electronics_map_id}</td>
                <td className={`${tdClass} text-right`}>
                  <button onClick={() => handleDelete(m.room_electronics_map_id)} className={`${btnDanger} opacity-100 sm:opacity-0 sm:group-hover:opacity-100`} title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main ManageOffice Component ────────────────────────────
export const ManageOffice: FC<ManageOfficeProps> = ({ refreshLayout }) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <RoomsTable onDataChange={refreshLayout} />
      <ElectronicsTable onDataChange={refreshLayout} />
      <RoomMapTable onDataChange={refreshLayout} />
    </div>
  );
};
