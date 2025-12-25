<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { apiClient } from '$lib/api/client';
  import { browser } from '$app/environment';

  let user = $authStore.user;
  let sending = false;
  let quill: any;
  let mounted = false;
  let editorReady = false;
  
  let subject = '';
  let delay = 2;
  let excelFile: File | null = null;
  let fileName = '';

  onMount(async () => {
    mounted = true;
    if (!user) {
      goto('/login');
      return;
    }

    if (browser) {
      try {
        const { default: Quill } = await import('quill');
        await import('quill/dist/quill.snow.css');
        
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const editorElement = document.getElementById('editor');
        if (editorElement) {
          quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Compose your email...',
            modules: {
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
              ]
            }
          });
          editorReady = true;
        }
      } catch (error) {
        console.error('Failed to load editor:', error);
        toastStore.show('Failed to load editor', 'error');
      }
    }
  });

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      excelFile = target.files[0];
      fileName = excelFile.name;
      toastStore.show(`File "${fileName}" selected`, 'success');
    }
  }

  async function sendEmails() {
    if (!subject.trim()) {
      toastStore.show('Please enter email subject', 'error');
      return;
    }

    if (!editorReady || !quill) {
      toastStore.show('Editor is still loading', 'error');
      return;
    }

    const htmlContent = quill.root.innerHTML;
    if (!htmlContent || htmlContent === '<p><br></p>') {
      toastStore.show('Please compose email content', 'error');
      return;
    }

    if (!excelFile) {
      toastStore.show('Please upload Excel file', 'error');
      return;
    }

    try {
      sending = true;
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('htmlContent', htmlContent);
      formData.append('delay', delay.toString());
      formData.append('excelFile', excelFile);

      const response = await apiClient.uploadFile('/send', formData);
      
      if (response.success) {
        toastStore.show(response.message || 'Emails are being sent!', 'success');
        subject = '';
        if (quill) quill.setContents([]);
        excelFile = null;
        fileName = '';
        goto('/reports');
      } else {
        toastStore.show(response.message || 'Failed to send emails', 'error');
      }
    } catch (error: any) {
      toastStore.show(error.message || 'Failed to send emails', 'error');
    } finally {
      sending = false;
    }
  }
</script>

<svelte:head>
  <title>Send Emails - Bulk Email Sender</title>
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
      <a href="/send" class="nav-link active">📧 Send Emails</a>
      <a href="/config" class="nav-link">⚙️ SMTP Config</a>
      <a href="/reports" class="nav-link">📈 Reports</a>
    </div>

    <main class="content">
      <h2>Send Bulk Emails</h2>

      <div class="form-card">
        <div class="form-section">
          <h3>1. Upload Contacts (Excel)</h3>
          <div class="file-upload">
            <input type="file" accept=".xlsx,.xls" on:change={handleFileChange} id="excel-file" />
            <label for="excel-file" class="file-label">
              {#if fileName}
                📄 {fileName}
              {:else}
                📁 Choose Excel File
              {/if}
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>2. Email Subject</h3>
          <input type="text" bind:value={subject} placeholder="Enter email subject" class="subject-input" />
        </div>

        <div class="form-section">
          <h3>3. Compose Email</h3>
          <div id="editor"></div>
        </div>

        <div class="form-section">
          <h3>4. Settings</h3>
          <div class="settings-row">
            <label>
              Delay (seconds):
              <input type="number" bind:value={delay} min="1" max="60" />
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-secondary" on:click={() => goto('/dashboard')}>Cancel</button>
          <button class="btn-primary" on:click={sendEmails} disabled={sending}>
            {sending ? '📤 Sending...' : '📧 Send Emails'}
          </button>
        </div>
      </div>
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

  :global(.ql-container) { min-height: 300px; }
  :global(.ql-editor) { min-height: 300px; }
  
  .dashboard { min-height: 100vh; background: #f5f7fa; }
  .navbar { background: white; padding: 16px 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
  .nav-brand h1 { font-size: 24px; color: #333; margin: 0; }
  .nav-user span { color: #666; }
  .sidebar { position: fixed; left: 0; top: 72px; width: 250px; height: calc(100vh - 72px); background: white; padding: 20px; box-shadow: 2px 0 4px rgba(0,0,0,0.1); }
  .nav-link { display: block; padding: 12px 16px; margin-bottom: 8px; color: #666; text-decoration: none; border-radius: 6px; transition: background 0.2s; }
  .nav-link:hover { background: #f5f7fa; }
  .nav-link.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .content { margin-left: 250px; padding: 40px; }
  h2 { font-size: 32px; margin-bottom: 30px; color: #333; }
  .form-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .form-section { margin-bottom: 32px; }
  .form-section h3 { font-size: 18px; margin-bottom: 16px; color: #333; }
  .file-upload { position: relative; }
  .file-upload input[type="file"] { display: none; }
  .file-label { display: inline-block; padding: 12px 24px; background: #f5f7fa; border: 2px dashed #667eea; border-radius: 8px; cursor: pointer; color: #667eea; font-weight: 500; transition: all 0.3s; }
  .file-label:hover { background: #667eea; color: white; }
  .subject-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
  .settings-row { display: flex; gap: 20px; }
  .settings-row label { display: flex; flex-direction: column; gap: 8px; color: #333; font-weight: 500; }
  .settings-row input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; width: 200px; }
  .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; }
  .btn-primary, .btn-secondary { padding: 12px 32px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px; }
  .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  .btn-secondary { background: #f5f7fa; color: #667eea; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
