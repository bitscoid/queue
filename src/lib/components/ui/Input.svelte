<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
  export let id: string | undefined;
  export let type: string = "text"; // bisa 'text', 'email', dll — abaikan jika textarea
  export let placeholder: string = "";
  export let value: string = "";
  export let className: string = "";
  export let required: boolean = false;
  export let name: string = "";
  export let readonly: boolean = false;
  export let disabled: boolean = false;
  export let multiline: boolean = false; // ✅ textarea jika true
  export let rows: number = 3;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

{#if multiline}
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <textarea
    {id}
    {name}
    class={`textarea textarea-bordered w-full ${className}`}
    {placeholder}
    bind:value
    {required}
    {readonly}
    {disabled}
    {rows}
    on:input={() => dispatch("input", value)}
  />
{:else}
  <input
    {id}
    {type}
    {name}
    class={`input input-bordered w-full ${className}`}
    {placeholder}
    bind:value
    {required}
    {readonly}
    {disabled}
    on:input={() => dispatch("input", value)}
  />
{/if}
