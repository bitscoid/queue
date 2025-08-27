<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Portal from "svelte-portal";

  export let show: boolean = false;
  export let className: string = "";

  const dispatch = createEventDispatcher();

  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function handleClose() {
    dispatch("close");
  }

  export let size:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full" = "md";

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full max-h-full h-full",
  }[size];
</script>

{#if show && mounted}
  <Portal target={document.body}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      on:click={handleClose}
    >
      <div
        class={`bg-base-100 rounded-lg p-6 w-full ${sizeClass} shadow-lg ${className}`}
        on:click|stopPropagation
      >
        <slot />
      </div>
    </div>
  </Portal>
{/if}
