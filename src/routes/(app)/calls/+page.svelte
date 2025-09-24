<script lang="ts">
  import { onMount } from "svelte";
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte";

  export let data;
  let { queue, allTickets, userName, userCode, currentUserId, isAdmin } = data;

  // Notification state
  let showNotification = false;
  let notificationTitle = "";
  let notificationMessage = "";
  let notificationType: "success" | "error" | "info" = "success";

  // Audio context for notifications
  let audioContext: AudioContext | null = null;

  // Calculate statistics based on all tickets
  $: stats = {
    pending: allTickets.filter((t: any) => t.status === "PENDING").length,
    called: allTickets.filter((t: any) => t.status === "CALLED").length,
    serving: allTickets.filter((t: any) => t.status === "SERVING").length,
    skipped: allTickets.filter((t: any) => t.status === "SKIPPED").length,
    completed: allTickets.filter((t: any) => t.status === "COMPLETED").length
  };

  // Ambil tiket yang statusnya PENDING berdasarkan allTickets untuk antrian menunggu
  $: pendingTickets = allTickets.filter((t: any) => t.status === "PENDING");

  // Ambil tiket yang sedang dipanggil atau ditangani berdasarkan queue.tickets (filtered for current user)
  $: servingTickets = queue.tickets.filter((t: any) => 
    (t.status === "CALLED" || t.status === "SERVING") && 
    t.servedByUserId === currentUserId
  );
  
  // Pastikan hanya 1 tiket yang ditampilkan dalam servingTickets
  $: displayedServingTickets = servingTickets.length > 0 ? [servingTickets[0]] : [];

  // WebSocket connection
  let ws: WebSocket | null = null;
  let isWsConnected = false;

  onMount(() => {
    // Connect to WebSocket for real-time updates
    const wsUrl = import.meta.env.DEV 
      ? "ws://localhost:4000" 
      : `ws://${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("✅ WebSocket connected for real-time updates");
      isWsConnected = true;
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        if (data.type === "TICKET_CALL") {
          // Handle ticket call notifications - only for current operator
          if (data.queue.id === queue.id && data.ticket.servedByUserId === currentUserId) {
            // Removed notification for ticket calls to avoid popup notifications
          }
        } else if (data.queues) {
          console.log("Updating queue data");
          // Find our queue in the updated data
          const updatedQueue = data.queues.find((q: any) => q.id === queue.id);
          if (updatedQueue) {
            console.log("Found updated queue:", updatedQueue);
            // Update queue tickets - only include tickets assigned to current user
            queue.tickets = ((updatedQueue.tickets || queue.tickets)
              .filter((t: { servedByUserId: number; }) => t.servedByUserId === currentUserId) // Only tickets for current user
              .map((t: { id: any; fullNumber: any; status: any; servedByUserId: any; }) => ({
                id: t.id,
                fullNumber: t.fullNumber,
                status: t.status,
                servedByUserId: t.servedByUserId
              })));
            
            // Update allTickets for statistics and waiting queue (all tickets for the queue)
            allTickets = (updatedQueue.tickets || allTickets).map((t: { id: any; fullNumber: any; status: any; }) => ({
              id: t.id,
              fullNumber: t.fullNumber,
              status: t.status
            }));
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };
    
    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      isWsConnected = false;
    };
    
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      isWsConnected = false;
    };

    // Initialize audio context
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }

    return () => {
      if (ws) {
        ws.close();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  });

  function showNotificationMessage(notifTitle: string, message: string, type: "info" | "success" | "error" = "success") {
    notificationTitle = notifTitle;
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
  }

  function playNotificationSound() {
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.value = 880; // A5 note
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds
    } catch (e) {
      console.warn("Error playing notification sound:", e);
    }
  }

  async function startServing(ticketId: number) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/serve`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        queue.tickets = queue.tickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status,
            servedByUserId: updatedTicket.servedByUserId
          } : t
        );
        // Also update allTickets to keep statistics in sync
        allTickets = allTickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status
          } : t
        );
        
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error tidak diketahui";
        showNotificationMessage("Gagal", `Gagal memulai pelayanan tiket: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }

  async function callNext() {
    // Cek apakah sudah ada tiket yang sedang ditangani
    if (servingTickets.length > 0) {
      showNotificationMessage("Peringatan", "Masih ada tiket yang sedang ditangani. Selesaikan terlebih dahulu.", "error");
      return;
    }

    if (!pendingTickets.length) {
      showNotificationMessage("Peringatan", "Tidak ada tiket tersisa.", "error");
      return;
    }

    const nextTicket = pendingTickets[0];

    try {
      const res = await fetch(`/api/tickets/${nextTicket.id}/call`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        queue.tickets = queue.tickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status,
            servedByUserId: updatedTicket.servedByUserId
          } : t
        );
        // Also update allTickets to keep statistics in sync
        allTickets = allTickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status
          } : t
        );
        showNotificationMessage("Berhasil", `Tiket ${updatedTicket.fullNumber} dipanggil`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error tidak diketahui";
        showNotificationMessage("Gagal", `Gagal memanggil tiket: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }

  async function completeCurrent(ticketId: number) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/complete`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        queue.tickets = queue.tickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status,
            servedByUserId: updatedTicket.servedByUserId
          } : t
        );
        // Also update allTickets to keep statistics in sync
        allTickets = allTickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status
          } : t
        );
        
        
        
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error tidak diketahui";
        showNotificationMessage("Gagal", `Gagal menyelesaikan tiket: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }

  async function skipCurrent(ticketId: number) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/skip`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        queue.tickets = queue.tickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status,
            servedByUserId: updatedTicket.servedByUserId
          } : t
        );
        // Also update allTickets to keep statistics in sync
        allTickets = allTickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status
          } : t
        );
        
        
        
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error tidak diketahui";
        showNotificationMessage("Gagal", `Gagal melewatkan tiket: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }

  async function recallTicket(ticketId: number) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/recall`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        queue.tickets = queue.tickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status,
            servedByUserId: updatedTicket.servedByUserId
          } : t
        );
        // Also update allTickets to keep statistics in sync
        allTickets = allTickets.map((t: any) =>
          t.id === updatedTicket.id ? {
            id: updatedTicket.id,
            fullNumber: updatedTicket.fullNumber,
            status: updatedTicket.status
          } : t
        );
        showNotificationMessage("Berhasil", `Tiket ${updatedTicket.fullNumber} dipanggil ulang`, "info");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error tidak diketahui";
        showNotificationMessage("Gagal", `Gagal memanggil ulang tiket: ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }

  // Function to refresh data manually
  async function refreshData() {
    try {
      const res = await fetch(`/api/queues/${queue.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        const updatedQueue = await res.json();
        // Update queue with proper mapping
        queue = {
          id: updatedQueue.id,
          code: updatedQueue.code,
          name: updatedQueue.name,
          ticketPrefix: updatedQueue.ticketPrefix,
          tickets: updatedQueue.tickets.map((t: any) => ({
            id: t.id,
            fullNumber: t.fullNumber,
            status: t.status,
            servedByUserId: t.servedByUserId
          }))
        };
        showNotificationMessage("Berhasil", "Data diperbarui", "success");
      } else {
        showNotificationMessage("Gagal", "Gagal memperbarui data", "error");
      }
    } catch (err) {
      console.error("Network error:", err);
      showNotificationMessage("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.", "error");
    }
  }
</script>

<DefaultLayout title="Panggilan Antrian - {queue.name}">
  <div class="w-full">
    <!-- Informasi Layanan dan Loket -->
    <div class="bg-base-100 rounded-xl shadow-md p-5 mb-6 w-full border border-base-200">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Informasi Layanan -->
        <div class="flex-1">
          <h2 class="text-2xl font-bold mb-3">{queue.name}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p class="text-base-content/70 text-sm">
              Layanan: <span class="font-mono bg-base-200 px-3 py-1 rounded-md text-xs font-medium">{queue.code}</span>
            </p>
            <p class="text-base-content/70 text-sm">
              Kode : <span class="font-mono bg-base-200 px-3 py-1 rounded-md text-xs font-medium">{queue.ticketPrefix}</span>
            </p>
          </div>
        </div>
        
        <!-- Informasi Loket/Operator -->
        <div class="flex-1">
          <h2 class="text-2xl font-bold mb-3">Loket Anda</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p class="text-base-content/70 text-sm">
              Loket : <span class="font-medium bg-base-200 px-3 py-1 rounded-md text-sm">{userName}</span>
            </p>
            <p class="text-base-content/70 text-sm">
              ID : <span class="font-mono bg-base-200 px-3 py-1 rounded-md text-xs font-medium">{currentUserId}</span>
            </p>
          </div>
        </div>
        
        <!-- Kontrol dan Status -->
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="flex items-center gap-2">
            <div class="badge badge-{isWsConnected ? 'success' : 'error'} gap-2 py-3 px-4 text-sm font-medium">
              {isWsConnected ? '🟢' : '🔴'} 
              {isWsConnected ? 'Live' : 'Offline'}
            </div>
          </div>
          <button 
            class="btn btn-primary btn-sm tooltip tooltip-left flex items-center gap-2" 
            data-tip="Refresh data"
            on:click={refreshData}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <NotificationModal 
      bind:show={showNotification}
      title={notificationTitle}
      message={notificationMessage}
      type={notificationType}
      onClose={() => showNotification = false}
    />

    <!-- Stats Summary -->
    <section class="w-full shadow-lg rounded-2xl p-4 md:p-6 mb-6 bg-base-100">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200">
          <div class="text-3xl font-bold text-blue-700">{stats.pending}</div>
          <div class="text-blue-600 font-medium mt-1">Menunggu</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 text-center border border-yellow-200">
          <div class="text-3xl font-bold text-yellow-700">
            {stats.called}
          </div>
          <div class="text-yellow-600 font-medium mt-1">Dipanggil</div>
        </div>
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center border border-green-200">
          <div class="text-3xl font-bold text-green-700">
            {stats.serving}
          </div>
          <div class="text-green-600 font-medium mt-1">Dalam Pelayanan</div>
        </div>
        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 text-center border border-red-200">
          <div class="text-3xl font-bold text-red-700">
            {stats.skipped}
          </div>
          <div class="text-red-600 font-medium mt-1">Dilewatkan</div>
        </div>
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200">
          <div class="text-3xl font-bold text-purple-700">
            {stats.completed}
          </div>
          <div class="text-purple-600 font-medium mt-1">Selesai</div>
        </div>
      </div>
    </section>

    <!-- Sedang Ditangani -->
    <section class="w-full shadow-lg rounded-2xl p-4 md:p-6 mb-6 bg-base-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        🎯 Sedang Ditangani
        {#if displayedServingTickets.length > 0}
          <span class="badge badge-secondary badge-md">{displayedServingTickets.length}</span>
        {/if}
      </h2>
      {#if displayedServingTickets.length}
        <div class="grid grid-cols-1 gap-4">
          {#each displayedServingTickets as t}
            <div
              class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-5 text-center shadow-lg {t.status === 'CALLED' ? 'animate-pulse' : ''}"
            >
              <div class="text-3xl font-bold mb-3">{t.fullNumber}</div>
              <div class="text-sm mb-2">Status: {t.status === 'CALLED' ? 'Dipanggil' : 'Dalam Pelayanan'}</div>
              <div class="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                {#if t.status === 'CALLED'}
                  <button
                    class="btn btn-info btn-sm flex-1 min-w-[100px]"
                    on:click={() => recallTicket(t.id)}
                  >
                    🔁 Panggil Ulang
                  </button>
                  <button
                    class="btn btn-warning btn-sm flex-1 min-w-[100px]"
                    on:click={() => skipCurrent(t.id)}
                  >
                    ⏭️ Skip
                  </button>
                  <button
                    class="btn btn-success btn-sm flex-1 min-w-[100px]"
                    on:click={() => startServing(t.id)}
                  >
                    🔄 Tangani
                  </button>
                {:else}
                  <button
                    class="btn btn-success btn-sm flex-1 min-w-[100px]"
                    on:click={() => completeCurrent(t.id)}
                  >
                    ✅ Selesai
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8 rounded-xl bg-base-200">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-base-content/70">
            Tidak ada tiket yang sedang ditangani
          </p>
        </div>
      {/if}
    </section>

    <!-- Antrian Selanjutnya -->
    <section class="w-full shadow-lg rounded-2xl p-4 md:p-6 bg-base-100">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        📋 Antrian Menunggu
        {#if pendingTickets.length > 0}
          <span class="badge badge-primary badge-md">{pendingTickets.length}</span>
        {/if}
      </h2>
      {#if pendingTickets.length}
        <ul class="space-y-3">
          {#each pendingTickets as t, i}
            <li
              class="flex justify-between items-center p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5
                        {i === 0
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow-lg'
                : 'bg-base-200'}"
            >
              <div class="flex items-center gap-3">
                <span class="badge badge-md {i === 0 ? 'badge-neutral' : 'badge-ghost'}">
                  #{i + 1}
                </span>
                <span class="text-xl font-mono">{t.fullNumber}</span>
              </div>
              {#if i === 0}
                <button 
                  class="btn btn-primary btn-sm flex items-center gap-2 font-semibold"
                  on:click={callNext}
                >
                  <span>▶</span>
                  <span>Panggil</span>
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-center py-8 rounded-xl bg-base-200">
          <div class="text-4xl mb-3">✅</div>
          <p class="text-base-content/70">Antrian sudah habis</p>
        </div>
      {/if}
    </section>
  </div>
</DefaultLayout>
