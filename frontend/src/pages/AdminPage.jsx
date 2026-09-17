import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Lock, AlertCircle, CheckCircle2, Clock, Play, LogOut } from 'lucide-react';
import { api } from '../services/api';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(api.getAdminUser());
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Login modal state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminpassword');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await api.getSyncStatus(10);
      setSyncStatus(data);
      setIsSyncing(data.is_syncing);
    } catch (err) {
      console.error('Failed to get sync status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await api.adminLogin(username, password);
      setAdminUser(data.username);
      fetchStatus();
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    setAdminUser(null);
  };

  const handleTriggerSync = async () => {
    if (!adminUser) return;
    setIsSyncing(true);
    setActionMessage(null);
    try {
      const res = await api.triggerSync();
      setActionMessage({ type: 'success', text: res.message });
      setTimeout(fetchStatus, 1500);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to trigger synchronization job.'
      });
      setIsSyncing(false);
    }
  };

  const lastSync = syncStatus?.last_sync;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Control Plane
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-1">
            Data Ingestion & Admin
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Orchestration and telemetry for data.gov.in AGMARKNET synchronization jobs
          </p>
        </div>

        {adminUser ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-neutral-800">Admin: {adminUser}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            Read-only mode. Authenticate below to trigger ingestion.
          </div>
        )}
      </div>

      {/* Sync Status Banner */}
      <div className="apple-glass-card rounded-3xl p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
              Live Pipeline Status
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  isSyncing
                    ? 'bg-amber-500 animate-ping'
                    : lastSync?.status === 'SUCCESS'
                    ? 'bg-emerald-500'
                    : 'bg-neutral-400'
                }`}
              />
              <h2 className="text-2xl font-semibold text-neutral-950">
                {isSyncing ? 'Synchronization In Progress' : 'Pipeline Healthy & Ready'}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Scheduled background sync interval: Every 6 hours • Source: data.gov.in
            </p>
          </div>

          <div>
            {adminUser ? (
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="apple-btn-primary px-6 py-3 rounded-full text-xs font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing AGMARKNET Data...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-neutral-400 font-mono">
                Log in as Admin to run manual sync
              </div>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Last Sync Attempt
            </span>
            <div className="text-sm font-semibold text-neutral-900 mt-1 font-mono">
              {lastSync?.started_at ? new Date(lastSync.started_at).toLocaleString() : 'Pending'}
            </div>
            <span className="text-[10px] text-neutral-400">
              Status: {lastSync?.status || 'N/A'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Records Added
            </span>
            <div className="text-2xl font-bold text-black mt-1 font-mono">
              {lastSync?.records_inserted?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-neutral-400">New price points</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Records Updated
            </span>
            <div className="text-2xl font-bold text-black mt-1 font-mono">
              {lastSync?.records_updated?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-neutral-400">Changed modal rates</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Records Rejected
            </span>
            <div className="text-2xl font-bold text-black mt-1 font-mono">
              {lastSync?.records_rejected?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-neutral-400">Malformed or null</span>
          </div>
        </div>
      </div>

      {/* Admin Login Box (if not logged in) */}
      {!adminUser && (
        <div className="max-w-md mx-auto apple-glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100">
            <Lock className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Administrator Authentication
            </h3>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-600 font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs focus:outline-none focus:border-black"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs focus:outline-none focus:border-black"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="apple-btn-primary w-full py-2.5 rounded-lg font-medium text-xs disabled:opacity-50 mt-2"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
            <div className="text-[10px] text-neutral-400 text-center">
              Default credentials in local dev: admin / adminpassword
            </div>
          </form>
        </div>
      )}

      {/* Sync Execution History Table */}
      <div className="apple-glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Recent Sync Execution Logs
            </h3>
            <p className="text-xs text-neutral-500">
              Audit log of scheduled and manual data imports
            </p>
          </div>
          <button
            onClick={fetchStatus}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-neutral-200/80 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Started At</th>
                <th className="py-3 px-6">Fetched</th>
                <th className="py-3 px-6">Inserted</th>
                <th className="py-3 px-6">Updated</th>
                <th className="py-3 px-6">Rejected</th>
                <th className="py-3 px-6">Error Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 font-mono">
              {syncStatus?.recent_logs?.length > 0 ? (
                syncStatus.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/80">
                    <td className="py-3.5 px-6 font-semibold text-neutral-900">#{log.id}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'RUNNING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-neutral-500 text-[11px]">
                      {new Date(log.started_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-900 font-semibold">{log.records_fetched}</td>
                    <td className="py-3.5 px-6 text-emerald-700 font-semibold">+{log.records_inserted}</td>
                    <td className="py-3.5 px-6 text-neutral-600">{log.records_updated}</td>
                    <td className="py-3.5 px-6 text-neutral-400">{log.records_rejected}</td>
                    <td className="py-3.5 px-6 text-[11px] text-neutral-400 max-w-xs truncate">
                      {log.error_message || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400 font-sans">
                    No sync logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
