<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Input from "$lib/components/ui/Input.svelte";

  export let id: string | undefined;
  export let label = "";
  export let type: string = "text";
  export let placeholder = "";
  export let value: string = "";
  export let hint = "";
  export let required = false;
  export let name = "";
  export let className = "";
  export let readonly = false;

  const dispatch = createEventDispatcher();
</script>

<div class="form-control w-full p-1">
  {#if label}
    <label class="label py-2" for={id}>
      <span class="label-text font-medium">{label}{required ? " *" : ""}</span>
    </label>
  {/if}

  <Input
    {id}
    {type}
    {placeholder}
    {required}
    {name}
    {readonly}
    className={`input input-bordered w-full ${className}`}
    bind:value
    on:input={(e) => dispatch("input", e.detail)}
  />

  {#if hint}
    <label class="label" for={id}>
      <span class="label-text-alt text-xs text-gray-500">{hint}</span>
    </label>
  {/if}
</div>
