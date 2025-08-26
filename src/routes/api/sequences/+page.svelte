<!-- src/routes/sequences/+page.svelte -->
<script lang="ts">
  export let data: { sequences: any[] };
</script>

<h1 class="text-xl font-bold mb-4">Daily Sequence</h1>

<table class="table-auto border-collapse border border-gray-300">
  <thead>
    <tr class="bg-gray-100">
      <th class="border px-2 py-1">Queue</th>
      <th class="border px-2 py-1">Date</th>
      <th class="border px-2 py-1">Next Seq</th>
    </tr>
  </thead>
  <tbody>
    {#each data.sequences as seq}
      <tr>
        <td class="border px-2 py-1">{seq.queue.name} ({seq.queue.code})</td>
        <td class="border px-2 py-1"
          >{new Date(seq.date).toLocaleDateString()}</td
        >
        <td class="border px-2 py-1">{seq.nextSeq}</td>
      </tr>
    {/each}
  </tbody>
</table>
