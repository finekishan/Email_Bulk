<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { apiClient } from '$lib/api/client';

  let user = $authStore.user;
  let configs: any[] = [];
  let loading = false;
  let showForm = false;
  let editingId: string | null = null;
  let mounted = false;

  let formData = {
    name: '',
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromEmail: '',
    fromName: '',
    isDefault: false
  };

  onMount(async () => {
    mounted = true;
    if (!user) {
      goto('/login');
      return;
    }
    await loadConfigs();
  });

  async function loadConfigs() {
    try {
      loading = true;
      const response = await apiClient.get('/config/smtp');
      if (response.success) {
        configs = response.userConfigs || [];
      }
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to load configs', 'error');
    } finally {
      loading = false;
    }
  }

  function openForm(config?: any) {
    if (config) {
      editingId = config.id;
      formData = { ...config };
    } else {
      editingId = null;
      formData = {
        name: '',
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        fromEmail: '',
        fromName: '',
        isDefault: false
      };
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  async function saveConfig() {
    try {
      loading = true;
      if (editingId) {
        await apiClient.put(`/config/smtp/${editingId}`, formData);
        toastStore.show('Configuration updated', 'success');
      } else {
        await apiClient.post('/config/smtp', formData);
        toastStore.show('Configuration added', 'success');
      }
      closeForm();
      await loadConfigs();
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to save', 'error');
    } finally {
      loading = false;
    }
  }

  async function deleteConfig(id: string) {
    if (!confirm('Delete this configuration?')) return;
    try {
      loading = true;
      await apiClient.delete(`/config/smtp/${id}`);
      toastStore.show('Configuration deleted', 'success');
      await loadConfigs();
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to delete', 'error');
    } finally {
      loading = false;
    }
  }

  async function setDefault(id: string) {
    try {
      loading = true;
      await apiClient.post(`/config/smtp/${id}/default`, {});
      toastStore.show('Default updated', 'success');
      await loadConfigs();
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to set default', 'error');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>SMTP Config - Bulk Email Sender</title>
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
      <a href="/config" class="nav-link active">⚙️ SMTP Config</a>
      <a href="/reports" class="nav-link">📈 Reports</a>
    </div>

    <main class="content">
      <div class="header">
        <h2>SMTP Configuration</h2>
        <button class="btn-primary" on:click={() => openForm()}>+ Add Config</button>
      </div>

      {#if loading && configs.length === 0}
        <div class="card"><p>Loading...</p></div>
      {:else if configs.length === 0}
        <div class="card">
          <p>No SMTP configurations yet.</p>
          <button class="btn-primary" on:click={() => openForm()}>Add First Config</button>
        </div>
      {:else}
        <div class="configs-grid">
          {#each configs as config}
            <div class="config-card">
              <div class="config-header">
                <h3>{config.name}</h3>
                {#if config.isDefault}
                  <span class="badge-default">Default</span>
                {/if}
              </div>
              <div class="config-details">
                <p><strong>Host:</strong> {config.host}:{config.port}</p>
                <p><strong>User:</strong> {config.user}</p>
                <p><strong>From:</strong> {config.fromEmail}</p>
              </div>
              <div class="config-actions">
                {#if !config.isDefault}
                  <button class="btn-secondary" on:click={() => setDefault(config.id)}>Set Default</button>
                {/if}
                <button class="btn-secondary" on:click={() => openForm(config)}>Edit</button>
                <button class="btn-danger" on:click={() => deleteConfig(config.id)}>Delete</button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>
{/if}

{#if showForm}
  <div class="modal-overlay" on:click={closeForm}>
    <div class="modal" on:click|stopPropagation>
      <h3>{editingId ? 'Edit' : 'Add'} SMTP Configuration</h3>
      <form on:submit|preventDefault={saveConfig}>
        <div class="form-group">
          <label>Configuration Name</label>
          <input type="text" bind:value={formData.name} placeholder="e.g., Gmail" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>SMTP Host</label>
            <input type="text" bind:value={formData.host} placeholder="smtp.gmail.com" required />
          </div>
          <div class="form-group">
            <label>Port</label>
            <input type="number" bind:value={formData.port} required />
          </div>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" bind:checked={formData.secure} />
            Use SSL/TLS
          </label>
        </div>
        <div class="form-group">
          <label>SMTP Username</label>
          <input type="text" bind:value={formData.user} placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>SMTP Password</label>
          <input type="password" bind:value={formData.pass} placeholder="••••••••" required />
        </div>
        <div class="form-group">
          <label>From Email</label>
          <input type="email" bind:value={formData.fromEmail} placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>From Name</label>
          <input type="text" bind:value={formData.fromName} placeholder="Your Name" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" bind:checked={formData.isDefault} />
            Set as default
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeForm}>Cancel</button>
          <button type="submit" class="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
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
  .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
  .configs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
  .config-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .config-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .config-header h3 { margin: 0; font-size: 18px; color: #333; }
  .badge-default { background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
  .config-details { margin-bottom: 16px; }
  .config-details p { margin: 8px 0; color: #666; font-size: 14px; }
  .config-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn-primary, .btn-secondary, .btn-danger { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; }
  .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .btn-secondary { background: #f5f7fa; color: #667eea; }
  .btn-danger { background: #dc3545; color: white; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal { background: white; padding: 32px; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .modal h3 { margin: 0 0 24px 0; font-size: 24px; color: #333; }
  .form-group { margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  .form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
  .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
  .form-group input[type="checkbox"] { width: auto; margin-right: 8px; }
  .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
</style>
