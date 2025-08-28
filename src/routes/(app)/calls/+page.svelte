<script lang="ts">
  export let data;
  let { queue } = data;

  // Ambil tiket yang statusnya PENDING
  $: pendingTickets = queue.tickets.filter((t) => t.status === "PENDING");

  // Ambil tiket yang sedang dipanggil
  $: servingTickets = queue.tickets.filter((t) => t.status === "SERVING");

  async function callNext() {
    if (!pendingTickets.length) return alert("Tidak ada tiket tersisa.");

    const nextTicket = pendingTickets[0];

    const res = await fetch(`/api/tickets/${nextTicket.id}/call`, {
      method: "POST",
    });

    if (res.ok) {
      const updatedTicket = await res.json();
      queue.tickets = queue.tickets.map((t) =>
        t.id === updatedTicket.id ? updatedTicket : t
      );
    } else {
      alert("Gagal memanggil tiket");
    }
  }

  async function completeCurrent(ticketId: number) {
    const res = await fetch(`/api/tickets/${ticketId}/complete`, {
      method: "POST",
    });

    if (res.ok) {
      const updatedTicket = await res.json();
      queue.tickets = queue.tickets.map((t) =>
        t.id === updatedTicket.id ? updatedTicket : t
      );
    } else {
      alert("Gagal menyelesaikan tiket");
    }
  }
</script>

<main
  class="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 p-6 flex flex-col items-center"
>
  <h1 class="text-4xl font-extrabold mb-6 text-center">Loket: {queue.name}</h1>

  <!-- Sedang Dipanggil -->
  <section class="w-full md:w-2/3 bg-white shadow-lg rounded-2xl p-6 mb-6">
    <h2 class="text-2xl font-semibold mb-4">🎯 Sedang Dipanggil</h2>
    {#if servingTickets.length}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each servingTickets as t}
          <div
            class="bg-red-500 text-white rounded-xl p-6 text-center animate-pulse shadow-lg"
          >
            <span class="text-4xl font-bold">{t.fullNumber}</span>
            <div class="mt-4">
              <button
                class="btn btn-success btn-sm"
                on:click={() => completeCurrent(t.id)}
              >
                ✅ Selesai
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-gray-500 text-lg text-center">
        Tidak ada tiket sedang dipanggil
      </p>
    {/if}
  </section>

  <!-- Antrian Selanjutnya -->
  <section class="w-full md:w-2/3 bg-white shadow-lg rounded-2xl p-6">
    <h2 class="text-2xl font-semibold mb-4">📋 Antrian Selanjutnya</h2>
    {#if pendingTickets.length}
      <ul class="space-y-2">
        {#each pendingTickets as t, i}
          <li
            class="flex justify-between items-center p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300
                      {i === 0
              ? 'bg-yellow-400 text-white font-bold'
              : 'bg-gray-100'}"
          >
            <span class="text-xl md:text-2xl">{t.fullNumber}</span>
            {#if i === 0}
              <button class="btn btn-primary btn-sm" on:click={callNext}
                >▶ Panggil</button
              >
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-500 text-lg text-center">Antrian sudah habis</p>
    {/if}
  </section>
</main>
