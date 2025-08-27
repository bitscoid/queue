<script lang="ts">
  import type { Queue } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-svelte";

  export let queues: Queue[] = [];
  export let onEdit: (queue: Queue) => void;
  export let onDelete: (queue: Queue) => void;

  export let sortKey: keyof Queue = "name";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: keyof Queue) => void;

  export let isAdmin: boolean = false;
</script>

<div
  class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100"
>
  <table class="table w-full min-w-[700px] text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" on:click={() => onSort("code")}>
          <div class="flex items-center gap-1">
            Code
            {#if sortKey === "code"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" on:click={() => onSort("name")}>
          <div class="flex items-center gap-1">
            Name
            {#if sortKey === "name"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" on:click={() => onSort("ticketPrefix")}>
          <div class="flex items-center gap-1">
            Ticket Prefix
            {#if sortKey === "ticketPrefix"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>
        {#if isAdmin}
          <th class="text-right pr-4">Actions</th>
        {/if}
      </tr>
    </thead>

    <tbody>
      {#each queues as queue}
        <tr class="hover:bg-base-100 transition">
          <td>{queue.code}</td>
          <td>{queue.name}</td>
          <td>{queue.ticketPrefix}</td>
          {#if isAdmin}
            <td class="text-right space-x-2 whitespace-nowrap">
              <IconButton
                icon={Pencil}
                color="btn-circle btn-outline btn-success"
                onClick={() => onEdit(queue)}
              />
              <IconButton
                icon={Trash2}
                color="btn-circle btn-outline btn-error"
                onClick={() => onDelete(queue)}
              />
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
