<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let message = "";
  export let isVisible = false;
  export let type: "info" | "success" | "warning" | "error" = "info";
  export let duration = 5000;

  let timeoutId: number;

  $: if (isVisible) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isVisible = false;
    }, duration);
  }

  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

{#if isVisible}
  <div 
    class="fixed top-4 right-4 z-50 animate-fade-in text-white px-5 py-4 rounded-xl shadow-lg border-l-4 border-white flex items-start gap-3 max-w-md"
    class:bg-blue-500={type === "info"}
    class:bg-green-500={type === "success"}
    class:bg-yellow-500={type === "warning"}
    class:bg-red-500={type === "error"}
  >
    <span class="text-2xl mt-0.5">
      {#if type === "info"} ℹ️
      {:else if type === "success"} ✅
      {:else if type === "warning"} ⚠️
      {:else if type === "error"} ❌
      {/if}
    </span>
    <span class="font-medium text-base">{message}</span>
  </div>
{/if}