<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  onMount(() => {
    if (browser) {
      window.location.href = '/login';
    }
  });
</script>

<div class="loading">
  <p>Redirecting to login...</p>
</div>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-size: 18px;
    color: #666;
  }
</style>
