<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string | number | null = null;
  export let options: { value: string | number; label: string }[] = [];
  export let required: boolean = false;
  export let disabled: boolean = false;
</script>

<div class="form-control w-full p-1">
  {#if label}
    <label class="label py-2" for={id}>
      <span class="label-text font-medium">{label}{required ? " *" : ""}</span>
    </label>
  {/if}
  <select
    {id}
    bind:value
    class="select select-bordered w-full"
    {required}
    {disabled}
  >
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</div>
