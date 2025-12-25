import { browser } from '$app/environment';
import { authStore } from '$lib/stores/auth';

export async function load() {
  if (!browser) return {};
  return {};
}
