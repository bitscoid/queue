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
    class="fixed top-4 right-4 z-50 animate-fade-in"
    class:bg-blue-500={type === "info"}
    class:bg-green-500={type === "success"}
    class:bg-yellow-500={type === "warning"}
    class:bg-red-500={type === "error"}
    class:text-white
    class:px-5={true}
    class:py-4={true}
    class:rounded-xl={true}
    class:shadow-lg={true}
    class:border-l-4={true}
    class:border-white={true}
    class:flex={true}
    class:items-start={true}
    class:gap-3={true}
    class:max-w-md={true}
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