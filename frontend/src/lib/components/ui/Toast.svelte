<script lang="ts">
  import { toastStore } from '$lib/stores/toast';
  import { fade, fly } from 'svelte/transition';

  $: toasts = $toastStore;

  function getToastIcon(type: string) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  }

  function getToastClass(type: string) {
    switch (type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      default: return 'toast-info';
    }
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div
      class="toast {getToastClass(toast.type)}"
      transition:fly={{ x: 400, duration: 300 }}
    >
      <div class="toast-icon">{getToastIcon(toast.type)}</div>
      <div class="toast-content">
        <span class="toast-message">{toast.message}</span>
      </div>
      <button class="toast-close" on:click={() => toastStore.remove(toast.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .toast {
    min-width: 320px;
    max-width: 500px;
    padding: 14px 16px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(10px);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(400px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toast-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border-left: 4px solid #34d399;
  }

  .toast-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-left: 4px solid #f87171;
  }

  .toast-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    border-left: 4px solid #fbbf24;
  }

  .toast-info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-left: 4px solid #60a5fa;
  }

  .toast-icon {
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .toast-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .toast-message {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    flex-shrink: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .toast-close:hover {
    opacity: 1;
  }
</style>
