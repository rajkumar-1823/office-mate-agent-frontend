import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import type { Room, Electronics, RoomElectronicsMap } from '../types';
import { ElectronicsType } from '../types';
import { Plus, Edit2, Trash2, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ManageOfficeProps {
  refreshLayout: () => void;
}

const API_BASE_URL = process.env.BACKEND_URL as string;

// ─── Shared Styles ──────────────────────────────────────────
const inputClass = 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400';
const selectClass = 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none';
const btnPrimary = 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow text-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed';
const btnDanger = 'p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all';
const btnEdit = 'p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all';
const btnSuccess = 'p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all';
const btnCancel = 'p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all';
const thClass = 'px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-gray-50 border-b border-gray-200';
const tdClass = 'px-6 py-4 text-sm text-slate-700 whitespace-nowrap border-b border-gray-100 group-hover:bg-gray-50/50 transition-colors';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/rooms`);
      setRooms(await res.json());
    } catch (e) { console.error('Failed to fetch rooms:', e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const roomKey = generateKey(newName);
    setIsSaving(true);
    await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: newName, room_key: roomKey }),
    });
    setNewName(''); setIsAdding(false); setIsSaving(false);
    fetchRooms(); onDataChange();
  };

  const handleEdit = async (roomId: string) => {
    setIsSaving(true);
    await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: editName, room_key: editKey }),
    });
    setEditingId(null); setIsSaving(false);
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Rooms</h3>
          <p className="text-sm text-slate-400">Manage office spaces</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Room
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-3 p-4 bg-blue-50/50 border-b border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 min-w-[150px]">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Room Name e.g. 'Conference Room'" className={inputClass} autoFocus />
          </div>
          <div className="text-sm text-slate-400 font-mono self-center min-w-[100px] px-3 py-2 bg-white rounded-lg border border-gray-300">
            {newName ? generateKey(newName) : 'auto-key'}
          </div>
          <div className="flex items-center gap-1">
            <button type="submit" disabled={isSaving} className={btnSuccess} title="Save">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </button>
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
          <tbody className="bg-white">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <span className="text-sm">Loading rooms…</span>
                </div>
              </td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No rooms found. Create one to get started.</td></tr>
            ) : null}
            {!isLoading && rooms.map(room => (
              <tr key={room._id} className="group">
                {editingId === room.room_id ? (
                  <>
                    <td className={tdClass}><input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} /></td>
                    <td className={tdClass}><input value={editKey} disabled className={`${inputClass} bg-gray-100 text-slate-400 cursor-not-allowed`} /></td>
                    <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{room.room_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(room.room_id)} disabled={isSaving} className={btnSuccess} title="Save">
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button onClick={() => setEditingId(null)} className={btnCancel} title="Cancel"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={tdClass}><span className="font-semibold text-slate-800">{room.room_name}</span></td>
                    <td className={tdClass}><span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-slate-500 border border-gray-200">{room.room_key}</span></td>
                    <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{room.room_id}</td>
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchElectronics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/electronics`);
      setElectronics(await res.json());
    } catch (e) { console.error('Failed to fetch electronics:', e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchElectronics(); }, [fetchElectronics]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const electronicsKey = generateKey(newName);
    setIsSaving(true);
    await fetch(`${API_BASE_URL}/electronics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ electronics_name: newName, electronics_key: electronicsKey, type: newType }),
    });
    setNewName(''); setNewType(ElectronicsType.LIGHT); setIsAdding(false); setIsSaving(false);
    fetchElectronics(); onDataChange();
  };

  const handleEdit = async (electronicsId: string) => {
    setIsSaving(true);
    await fetch(`${API_BASE_URL}/electronics/${electronicsId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ electronics_name: editName, electronics_key: editKey, type: editType }),
    });
    setEditingId(null); setIsSaving(false);
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Electronics</h3>
          <p className="text-sm text-slate-400">Manage devices and equipment</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Device
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-3 p-4 bg-blue-50/50 border-b border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-[2] min-w-[140px]">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Device Name" className={inputClass} autoFocus />
          </div>
          <div className="flex-1 min-w-[100px]">
            <div className="text-sm text-slate-400 font-mono px-3 py-2 bg-white rounded-lg border border-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
              {newName ? generateKey(newName) : 'auto-key'}
            </div>
          </div>
          <div className="flex-1 min-w-[120px]">
            <select value={newType} onChange={e => setNewType(e.target.value as ElectronicsType)} className={selectClass}>
              {Object.values(ElectronicsType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button type="submit" disabled={isSaving} className={btnSuccess} title="Save">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </button>
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
          <tbody className="bg-white">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <span className="text-sm">Loading electronics…</span>
                </div>
              </td></tr>
            ) : electronics.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No electronics found. Add one to get started.</td></tr>
            ) : null}
            {!isLoading && electronics.map(el => (
              <tr key={el._id} className="group">
                {editingId === el.electronics_id ? (
                  <>
                    <td className={tdClass}><input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} /></td>
                    <td className={tdClass}><input value={editKey} disabled className={`${inputClass} bg-gray-100 text-slate-400 cursor-not-allowed`} /></td>
                    <td className={tdClass}>
                      <select value={editType} onChange={e => setEditType(e.target.value as ElectronicsType)} className={selectClass}>
                        {Object.values(ElectronicsType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className={tdClass}><span className="text-slate-400 text-xs">{el.state}</span></td>
                    <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{el.electronics_id}</td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(el.electronics_id)} disabled={isSaving} className={btnSuccess} title="Save">
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button onClick={() => setEditingId(null)} className={btnCancel} title="Cancel"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={tdClass}><span className="font-semibold text-slate-800">{el.electronics_name}</span></td>
                    <td className={tdClass}><span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-slate-500 border border-gray-200">{el.electronics_key}</span></td>
                    <td className={tdClass}>
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                        el.type === 'LIGHT' && 'bg-amber-50 text-amber-700 border-amber-200',
                        el.type === 'AC' && 'bg-sky-50 text-sky-700 border-sky-200',
                        el.type === 'TV' && 'bg-violet-50 text-violet-700 border-violet-200',
                        el.type === 'SPEAKER' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        !['LIGHT','AC','TV','SPEAKER'].includes(el.type) && 'bg-gray-100 text-slate-600 border-gray-200',
                      )}>{el.type}</span>
                    </td>
                    <td className={tdClass}>
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                        el.state === 'ON' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-slate-500 border-gray-200'
                      )}>{el.state}</span>
                    </td>
                    <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{el.electronics_id}</td>
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [mapsRes, roomsRes, electronicsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/room-electronics-map`),
        fetch(`${API_BASE_URL}/rooms`),
        fetch(`${API_BASE_URL}/electronics`),
      ]);
      setMaps(await mapsRes.json());
      setRooms(await roomsRes.json());
      setElectronics(await electronicsRes.json());
    } catch (e) { console.error('Failed to fetch map data:', e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getRoomName = (roomId: string) => rooms.find(r => r.room_id === roomId)?.room_name || roomId;
  const getElectronicsName = (elId: string) => electronics.find(e => e.electronics_id === elId)?.electronics_name || elId;

  const unmappedElectronics = electronics.filter(
    el => !maps.some(m => m.electronics_id === el.electronics_id)
  );

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!mapRoomId || !mapElectronicsId) return;
    setErrorMsg(''); setIsSaving(true);
    const res = await fetch(`${API_BASE_URL}/room-electronics-map`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: mapRoomId, electronics_id: mapElectronicsId }),
    });
    setIsSaving(false);
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-10">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Assignments</h3>
          <p className="text-sm text-slate-400">Map devices to rooms</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={btnPrimary}>
          <Plus size={18} /> Add Mapping
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 p-4 bg-blue-50/50 border-b border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <select value={mapRoomId} onChange={e => setMapRoomId(e.target.value)} className={selectClass}>
                <option value="">Select a Room</option>
                {rooms.map(r => <option key={r._id} value={r.room_id}>{r.room_name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <select value={mapElectronicsId} onChange={e => setMapElectronicsId(e.target.value)} className={selectClass}>
                <option value="">Select an Electronic</option>
                {unmappedElectronics.map(el => <option key={el._id} value={el.electronics_id}>{el.electronics_name} ({el.electronics_id})</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="submit" disabled={isSaving} className={btnSuccess} title="Save">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className={btnCancel} title="Cancel"><X size={18} /></button>
            </div>
          </div>
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
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
          <tbody className="bg-white">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <span className="text-sm">Loading assignments…</span>
                </div>
              </td></tr>
            ) : maps.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No mappings found. Map a device to a room.</td></tr>
            ) : null}
            {!isLoading && maps.map(m => (
              <tr key={m._id} className="group hover:bg-gray-50/50 transition-colors">
                <td className={tdClass}><span className="font-medium text-slate-800">{getRoomName(m.room_id)}</span></td>
                <td className={tdClass}><span className="font-medium text-slate-800">{getElectronicsName(m.electronics_id)}</span></td>
                <td className={`${tdClass} text-slate-400 font-mono text-xs`}>{m.room_electronics_map_id}</td>
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
