<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { authApi } from '$lib/api/auth';
  import { apiClient } from '$lib/api/client';
  import { toastStore } from '$lib/stores/toast';

  let user = $authStore.user;
  let loading = true;
  let mounted = false;
  let stats = { totalSent: 0, successRate: 0, failed: 0, scheduled: 0 };

  onMount(async () => {
    mounted = true;
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        authStore.setUser(response.user);
        user = response.user;
        
        // Fetch dashboard stats
        try {
          const statsResponse = await apiClient.get('/dashboard/stats');
          if (statsResponse.success && statsResponse.data) {
            stats = statsResponse.data;
          }
        } catch (error) {
          console.error('Failed to load stats:', error);
        }
        
        loading = false;
      } else {
        loading = false;
        goto('/login');
      }
    } catch (error: any) {
      loading = false;
      goto('/login');
    }
  });

  async function handleLogout() {
    try {
      await authApi.logout();
      authStore.logout();
      toastStore.show('Logged out successfully', 'success');
      goto('/login');
    } catch (error) {
      toastStore.show('Logout failed', 'error');
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Bulk Email Sender</title>
</svelte:head>

{#if !mounted || loading}
  <div class="loading-container">
    <div class="spinner"></div>
    <p>Loading dashboard...</p>
  </div>
{:else}
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>🚀 Bulk Email Sender</h1>
      </div>
      <div class="nav-user">
        <span>Welcome, {user?.name || 'User'}!</span>
        <button on:click={handleLogout} class="btn-logout">Logout</button>
      </div>
    </nav>

    <div class="sidebar">
      <a href="/dashboard" class="nav-link active">📊 Dashboard</a>
      <a href="/send" class="nav-link">📧 Send Emails</a>
      <a href="/config" class="nav-link">⚙️ SMTP Config</a>
      <a href="/reports" class="nav-link">📈 Reports</a>
    </div>

    <main class="content">
      <h2>Dashboard</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Sent</h3>
          <p class="stat-value">{stats.totalSent}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">{stats.successRate}%</p>
        </div>
        <div class="stat-card">
          <h3>Failed</h3>
          <p class="stat-value">{stats.failed}</p>
        </div>
        <div class="stat-card">
          <h3>Scheduled</h3>
          <p class="stat-value">{stats.scheduled}</p>
        </div>
      </div>

      <div class="welcome-card">
        <h3>Welcome to Bulk Email Sender! 🎉</h3>
        <p>Get started by configuring your SMTP settings and sending your first email campaign.</p>
        <div class="action-buttons">
          <a href="/config" class="btn-primary">Configure SMTP</a>
          <a href="/send" class="btn-secondary">Send Emails</a>
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
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

  .loading-container p {
    margin-top: 16px;
    color: #666;
  }

  .dashboard {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .navbar {
    background: white;
    padding: 16px 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand h1 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-user span {
    color: #666;
  }

  .btn-logout {
    padding: 8px 16px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-logout:hover {
    background: #c82333;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 72px;
    width: 250px;
    height: calc(100vh - 72px);
    background: white;
    padding: 20px;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }

  .nav-link {
    display: block;
    padding: 12px 16px;
    margin-bottom: 8px;
    color: #666;
    text-decoration: none;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .nav-link:hover {
    background: #f5f7fa;
  }

  .nav-link.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .content {
    margin-left: 250px;
    padding: 40px;
  }

  h2 {
    font-size: 32px;
    margin-bottom: 30px;
    color: #333;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-card h3 {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #667eea;
    margin: 0;
  }

  .welcome-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .welcome-card h3 {
    font-size: 24px;
    margin-bottom: 16px;
    color: #333;
  }

  .welcome-card p {
    color: #666;
    margin-bottom: 24px;
  }

  .action-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-secondary {
    background: #f5f7fa;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-primary:hover, .btn-secondary:hover {
    transform: translateY(-2px);
  }
</style>
