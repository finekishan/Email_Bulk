<script lang="ts">
  import { goto } from '$app/navigation';
  import { authApi } from '$lib/api/auth';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';

  let email = '';
  let password = '';
  let loading = false;

  async function handleLogin() {
    if (!email || !password) {
      toastStore.show('Please fill in all fields', 'error');
      return;
    }

    loading = true;
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.user) {
        authStore.setUser(response.user);
        toastStore.show('Login successful!', 'success');
        goto('/dashboard');
      }
    } catch (error: any) {
      toastStore.show(error.message || 'Login failed', 'error');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Bulk Email Sender</title>
</svelte:head>

<div class="auth-container">
  <div class="auth-card">
    <h1>🚀 Bulk Email Sender</h1>
    <h2>Login to your account</h2>

    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="your@email.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <p class="auth-link">
      Don't have an account? <a href="/register">Register here</a>
    </p>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .auth-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 10px;
    text-align: center;
    color: #333;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 30px;
    text-align: center;
    color: #666;
    font-weight: normal;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
  }

  .btn-primary {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .auth-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
  }

  .auth-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }

  .auth-link a:hover {
    text-decoration: underline;
  }
</style>
