<script lang="ts">
  import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-svelte";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import type { TicketDisplay } from "$lib/types";

  // Props
  export let tickets: TicketDisplay[] = [];
  export let onEdit: (ticket: TicketDisplay) => void;
  export let onDelete: (ticket: TicketDisplay) => void;
  export let sortKey: keyof TicketDisplay = "fullNumber";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: keyof TicketDisplay) => void;
  export let isAdmin = false;
</script>

<div
  class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100"
>
  <table class="table w-full min-w-[800px] text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" on:click={() => onSort("fullNumber")}>
          <div class="flex items-center gap-1">
            Ticket
            {#if sortKey === "fullNumber"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4" />
              {:else}
                <ChevronDown class="w-4 h-4" />
              {/if}
            {/if}
          </div>
        </th>
        <th class="cursor-pointer" on:click={() => onSort("queueName")}
          >Queue</th
        >
        <th class="cursor-pointer" on:click={() => onSort("status")}>Status</th>
        <th class="cursor-pointer" on:click={() => onSort("servedByName")}
          >Served By</th
        >
        <th class="cursor-pointer" on:click={() => onSort("date")}>Date</th>
        {#if isAdmin}<th class="text-right pr-4">Actions</th>{/if}
      </tr>
    </thead>

    <tbody>
      {#each tickets as t}
        <tr class="hover:bg-base-100 transition">
          <td>{t.fullNumber}</td>
          <td>{t.queueName}</td>
          <td>{t.status}</td>
          <td>{t.servedByName || "-"}</td>
          <td>{new Date(t.date).toLocaleString()}</td>
          {#if isAdmin}
            <td class="text-right space-x-2">
              <IconButton
                icon={Pencil}
                color="btn-circle btn-outline btn-success"
                onClick={() => onEdit(t)}
              />
              <IconButton
                icon={Trash2}
                color="btn-circle btn-outline btn-error"
                onClick={() => onDelete(t)}
              />
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
