<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { apiClient } from '$lib/api/client';

  let user = $authStore.user;
  let logs: any[] = [];
  let stats = { total: 0, sent: 0, failed: 0, successRate: '0' };
  let loading = false;
  let mounted = false;

  onMount(async () => {
    mounted = true;
    if (!user) {
      goto('/login');
      return;
    }
    await loadReports();
  });

  async function loadReports() {
    try {
      loading = true;
      const response = await apiClient.get('/report');
      if (response.success) {
        logs = response.data.logs || [];
        stats = response.data.stats || stats;
      }
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to load reports', 'error');
    } finally {
      loading = false;
    }
  }

  async function clearLogs() {
    if (!confirm('Clear all logs?')) return;
    try {
      loading = true;
      await apiClient.delete('/report/clear');
      toastStore.show('Logs cleared', 'success');
      await loadReports();
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to clear', 'error');
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }
</script>

<svelte:head>
  <title>Reports - Bulk Email Sender</title>
</svelte:head>

{#if !mounted}
  <div class="loading-container">
    <div class="spinner"></div>
  </div>
{:else}
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-brand"><h1>🚀 Bulk Email Sender</h1></div>
      <div class="nav-user"><span>Welcome, {user?.name || 'User'}!</span></div>
    </nav>

    <div class="sidebar">
      <a href="/dashboard" class="nav-link">📊 Dashboard</a>
      <a href="/send" class="nav-link">📧 Send Emails</a>
      <a href="/config" class="nav-link">⚙️ SMTP Config</a>
      <a href="/reports" class="nav-link active">📈 Reports</a>
    </div>

    <main class="content">
      <div class="header">
        <h2>Email Reports</h2>
        {#if logs.length > 0}
          <button class="btn-danger" on:click={clearLogs} disabled={loading}>Clear Logs</button>
        {/if}
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Sent</h3>
          <p class="stat-value">{stats.total}</p>
        </div>
        <div class="stat-card">
          <h3>Successful</h3>
          <p class="stat-value success">{stats.sent}</p>
        </div>
        <div class="stat-card">
          <h3>Failed</h3>
          <p class="stat-value danger">{stats.failed}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">{stats.successRate}%</p>
        </div>
      </div>

      {#if loading}
        <div class="card"><p>Loading...</p></div>
      {:else if logs.length === 0}
        <div class="card">
          <p>No email logs yet.</p>
          <a href="/send" class="btn-primary">Send Emails</a>
        </div>
      {:else}
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subject</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {#each logs as log}
                <tr>
                  <td>{log.email}</td>
                  <td>
                    <span class="badge badge-{log.status.toLowerCase()}">{log.status}</span>
                  </td>
                  <td>{log.subject || '-'}</td>
                  <td>{formatDate(log.timestamp)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </main>
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f7fa;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .dashboard { min-height: 100vh; background: #f5f7fa; }
  .navbar { background: white; padding: 16px 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
  .nav-brand h1 { font-size: 24px; color: #333; margin: 0; }
  .nav-user span { color: #666; }
  .sidebar { position: fixed; left: 0; top: 72px; width: 250px; height: calc(100vh - 72px); background: white; padding: 20px; box-shadow: 2px 0 4px rgba(0,0,0,0.1); }
  .nav-link { display: block; padding: 12px 16px; margin-bottom: 8px; color: #666; text-decoration: none; border-radius: 6px; transition: background 0.2s; }
  .nav-link:hover { background: #f5f7fa; }
  .nav-link.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .content { margin-left: 250px; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  h2 { font-size: 32px; color: #333; margin: 0; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
  .stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .stat-card h3 { font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 500; }
  .stat-value { font-size: 32px; font-weight: 700; color: #667eea; margin: 0; }
  .stat-value.success { color: #28a745; }
  .stat-value.danger { color: #dc3545; }
  .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
  .table-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f5f7fa; }
  th, td { padding: 16px; text-align: left; border-bottom: 1px solid #eee; }
  th { font-weight: 600; color: #333; }
  td { color: #666; }
  .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
  .badge-sent { background: #d4edda; color: #155724; }
  .badge-failed, .badge-error { background: #f8d7da; color: #721c24; }
  .btn-primary, .btn-danger { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; }
  .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .btn-danger { background: #dc3545; color: white; }
  .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
