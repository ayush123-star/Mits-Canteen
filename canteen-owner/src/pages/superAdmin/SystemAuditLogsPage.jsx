import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

export const SystemAuditLogsPage = () => {
  const { auditLogs } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const modules = ['ALL', 'AUTH', 'ORDERS', 'INVENTORY', 'RECIPES', 'CANTEENS', 'PAYMENTS'];

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedModule !== 'ALL' && log.module !== selectedModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchActor = log.actor?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchIp = log.ip?.includes(q);
      if (!matchActor && !matchAction && !matchDetails && !matchIp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Platform Security & Audit Trails
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Immutable log of system modifications: authentication events, manual stock adjustments, status changes, and manager actions.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Official Compliance Audit Log to CSV...')}
          className="px-4 py-2.5 rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Audit Trail (.csv)
        </button>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actor, action type, IP address or details..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedModule === m
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#151C30] text-[#AAB3C5] hover:text-white border border-purple-500/20'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Audit Logs Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-4">Actor</th>
                <th className="py-4 px-4">Module</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-5 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#AAB3C5]">
                    No audit records match filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#151C30]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[#AAB3C5] text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.actor}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#151C30] border border-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono text-[#AAB3C5] text-[11px]">
                      {log.ip || '192.168.1.42'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAuditLogsPage;
