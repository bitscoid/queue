<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  type Queue = {
    id: number;
    name: string;
    code: string;
    color?: string;
    current: string[];
    remaining: number;
    counterTickets?: Record<string, string[]>;
    counters?: Array<{
      id: number;
      name: string;
      code: string;
      ticket: string;
      ticketStatus?: string | null;
    }>;
    tickets?: Array<{
      id: number;
      fullNumber: string;
      status: string;
      servedByUserId: number | null;
      queueId: number;
      seqNumber: number;
      date: string;
    }>;
  };

  type Settings = {
    appName: string;
    appDesc: string;
  };

  type Operator = {
    name: string;
    code: string;
  };

  type TicketNotification = {
    ticket: string;
    queue: string;
    operator?: Operator;
    status: string;
  };

  const queues = writable<Queue[]>([]);
  const settings = writable<Settings>({ appName: "Riza Antrian", appDesc: "Sistem Manajemen Antrian Digital" });
  const currentTime = writable<string>(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const currentDate = writable<string>(new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }));
  const lastCalledTicket = writable<TicketNotification | null>(null);

  let ws: WebSocket | null = null;
  let interval: number | undefined = undefined;
  let pingInterval: number | undefined = undefined;

  onMount(() => {
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          settings.set({
            appName: data.appName || "Riza Antrian",
            appDesc: data.appDesc || "Sistem Manajemen Antrian Digital"
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();

    const wsUrl = import.meta.env.DEV 
      ? "ws://localhost:4000" 
      : `ws://${window.location.host}`;
      
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      // Send ping every 30 seconds to keep connection alive
      pingInterval = window.setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "PING" }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Display received WebSocket message:", data);
        
        // Handle ticket call notifications
        if (data.type === "TICKET_CALL") {
          // Only show notification for certain statuses
          if (data.ticket.status !== "COMPLETED" && data.ticket.status !== "SKIPPED") {
            lastCalledTicket.set({
              ticket: data.ticket.fullNumber,
              queue: data.queue.name,
              operator: data.operator, // Include operator info if available
              status: data.ticket.status // Include ticket status
            });
            
            // Clear the notification after 10 seconds
            setTimeout(() => {
              lastCalledTicket.set(null);
            }, 10000);
          } else {
            // For completed or skipped tickets, clear any existing notification
            lastCalledTicket.set(null);
          }
        }
        // Handle queue updates
        else if (data.queues) {
          console.log("Display updating queues data");
          // Update queues data
          queues.set(
            data.queues.map((q: any) => ({
              id: q.id,
              name: q.name,
              code: q.code,
              current: q.current || [],
              remaining: q.remaining || 0,
              counterTickets: q.counterTickets || {},
              counters: q.counters || [],
              tickets: q.tickets || [],
              color: getQueueColor(q.code),
            }))
          );
        }
        
        // Update time from server if provided
        if (data.time) {
          const serverTime = new Date(data.time);
          currentTime.set(serverTime.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }));
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 5000);
    };
    
    ws.onerror = (err) => console.error("WebSocket error:", err);

    // Update time every second from client
    interval = window.setInterval(() => {
      currentTime.set(new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      currentDate.set(new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }));
    }, 1000);

    return () => {
      if (ws) {
        ws.close();
      }
      if (interval) {
        window.clearInterval(interval);
      }
      if (pingInterval) {
        window.clearInterval(pingInterval);
      }
    };
  });

  function getQueueColor(code: string) {
    // Map the colors based on the counter codes
    const colors: Record<string, string> = {
      "PC-1": "#10B981", // Emerald
      "PC-2": "#3B82F6", // Blue
      "PC-3": "#F59E0B", // Amber (Orange)
      "PC-4": "#8B5CF6", // Violet
      "PC-5": "#EF4444", // Red
      "PC-6": "#06B6D4", // Cyan
    };
    return colors[code] ?? "#F59E0B";
  }

  function getQueueBgColor(code: string) {
    // Map the background colors based on the counter codes
    const colors: Record<string, string> = {
      "PC-1": "bg-emerald-500/10 border-emerald-500/20",
      "PC-2": "bg-blue-500/10 border-blue-500/20",
      "PC-3": "bg-amber-500/10 border-amber-500/20",
      "PC-4": "bg-violet-500/10 border-violet-500/20",
      "PC-5": "bg-red-500/10 border-red-500/20",
      "PC-6": "bg-cyan-500/10 border-cyan-500/20",
    };
    return colors[code] ?? "bg-amber-500/10 border-amber-500/20";
  }

  // Fungsi untuk menghitung statistik antrian
  function calculateQueueStats(queues: Queue[]) {
    let totalRemaining = 0;
    let totalServed = 0;
    let totalCurrent = 0;
    let totalSkipped = 0;
    let totalAllTickets = 0; // Total of all tickets regardless of status
    
    queues.forEach(queue => {
      totalRemaining += queue.remaining || 0;
      totalCurrent += (queue.current?.length || 0);
      // Count tickets by status across all queues
      if (queue.tickets) {
        queue.tickets.forEach(ticket => {
          totalAllTickets++; // Count all tickets created today
          switch (ticket.status) {
            case "COMPLETED":
              totalServed++;
              break;
            case "SKIPPED":
              totalSkipped++;
              break;
          }
        });
      }
    });
    
    return {
      current: totalCurrent,
      total: totalAllTickets, // Total of all tickets created today regardless of status
      remaining: totalRemaining,
      served: totalServed,
      skipped: totalSkipped
    };
  }
</script>

<div class="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen w-full flex flex-col fullscreen-container">
  <!-- Notification for called ticket -->
  {#if $lastCalledTicket}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fade-in">
      <div class="text-center p-6 md:p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-2xl max-w-6xl w-full mx-2">
        <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
          {#if $lastCalledTicket.status === "CALLED"}
            NOMOR ANTRIAN
          {:else if $lastCalledTicket.status === "SERVING"}
            NOMOR ANTRIAN
          {:else if $lastCalledTicket.status === "CALLED"}
            PANGGILAN ULANG ANTRIAN
          {:else if $lastCalledTicket.status === "SKIPPED"}
            ANTRIAN DILEWATKAN
          {:else}
            STATUS ANTRIAN
          {/if}
        </div>
        <div class="text-8xl md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-bold text-white my-4 md:my-8 animate-pulse">{$lastCalledTicket.ticket}</div>
        {#if $lastCalledTicket.operator}
          <div class="text-3xl md:text-4xl lg:text-5xl text-white mt-4 md:mt-6">
            {#if $lastCalledTicket.status === "CALLED"}
              SILAHKAN MENUJU KE {$lastCalledTicket.operator.name}
            {:else if $lastCalledTicket.status === "SERVING"}
              SEDANG DITANGANI OLEH {$lastCalledTicket.operator.name}
            {:else if $lastCalledTicket.status === "CALLED"}
              SILAHKAN MENUJU KE {$lastCalledTicket.operator.name}
            {:else if $lastCalledTicket.status === "SKIPPED"}
              ANTRIAN DILEWATKAN OLEH {$lastCalledTicket.operator.name}
            {:else}
              DITANGANI OLEH {$lastCalledTicket.operator.name}
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Main Content - Dynamic Counter Cards -->
  <main class="flex-grow w-full">
    {#await $queues}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
        <!-- Loading State - Show 6 static cards while loading -->
        {#each Array(6) as _, i}
          <div class="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 min-h-[350px] flex flex-col animate-pulse">
            <div class="p-6 border-b border-gray-700/50">
              <div class="flex justify-between items-center">
                <div class="h-8 bg-gray-700 rounded w-32"></div>
                <div class="h-8 bg-gray-700 rounded w-12"></div>
              </div>
              <div class="mt-3 h-6 bg-gray-700 rounded w-24"></div>
            </div>
            <div class="p-8 flex-1 flex flex-col items-center justify-center">
              <div class="h-12 bg-gray-700 rounded w-24 mb-3"></div>
              <div class="h-16 bg-gray-700 rounded w-40"></div>
            </div>
          </div>
        {/each}
      </div>
    {:then queuesData}
      <!-- Get the first queue (assuming all operators use the same queue) -->
      {@const mainQueue = queuesData.length > 0 ? queuesData[0] : null}
      
      {#if mainQueue && mainQueue.counters && mainQueue.counters.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {#each mainQueue.counters as counter}
            <div class="bg-gray-800/40 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300 {getQueueBgColor(counter.code)} min-h-[350px] flex flex-col">
              <!-- Card Header -->
              <div class="p-6 border-b border-gray-700/50" style="border-color: {getQueueColor(counter.code)}40;">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full" style="background-color: {getQueueColor(counter.code)};"></span>
                    {counter.name}
                  </h2>
                  <span class="bg-gray-700 px-3 py-2 rounded-full text-sm md:text-base lg:text-lg font-medium">
                    {counter.code}
                  </span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-8 flex-1 flex flex-col items-center justify-center">
                <div class="text-center w-full">
                  {#if counter.ticket && counter.ticket !== "-"}
                    <div 
                      class="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold py-6 px-4 rounded-2xl {counter.ticketStatus === 'CALLED' ? 'animate-pulse' : ''}"
                      style="color: {getQueueColor(counter.code)}; text-shadow: 0 0 15px {getQueueColor(counter.code)}60; font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;"
                    >
                      {counter.ticket}
                    </div>
                  {:else}
                    <div class="text-6xl md:text-7xl lg:text-8xl font-bold py-8 text-gray-600" style="font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;">
                      -
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Fallback to static counters if no dynamic data -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {#each Array(6) as _, i}
            <div class="bg-gray-800/40 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300 border-amber-500/20 min-h-[350px] flex flex-col">
              <!-- Card Header -->
              <div class="p-6 border-b border-gray-700/50" style="border-color: #F59E0B40;">
                <div class="flex justify-between items-center">
                  <h2 class="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full" style="background-color: #F59E0B;"></span>
                    Operator PC-{i + 1}
                  </h2>
                  <span class="bg-gray-700 px-3 py-2 rounded-full text-sm md:text-base lg:text-lg font-medium">
                    PC-{i + 1} (PEMANGGIL)
                  </span>
                </div>
                <div class="mt-2 text-sm md:text-base lg:text-lg text-gray-400">
                  Antrian: <span class="font-semibold text-white">0</span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-8 flex-1 flex flex-col items-center justify-center">
                <div class="text-center w-full">
                  <div class="text-6xl md:text-7xl lg:text-8xl font-bold py-8 text-gray-600" style="font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;">
                    -
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/await}
  </main>

  <!-- Footer with Queue Statistics -->
  <footer class="mt-2 border-gray-800 w-full flex-shrink-0">
    {#await $queues}
      <div class="text-center text-gray-500 text-base md:text-lg animate-pulse">Memuat statistik antrian...</div>
    {:then queuesData}
      {@const stats = calculateQueueStats(queuesData)}
      <!-- Detailed Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-1 md:gap-2 mb-1">
        <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-2 md:p-3 text-center border border-blue-500/30">
          <div class="text-xl md:text-2xl lg:text-3xl font-bold text-blue-400">{stats.total}</div>
          <div class="text-blue-300 text-xs md:text-sm lg:text-base mt-1">Total Antrian</div>
        </div>
        <div class="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-2 md:p-3 text-center border border-orange-500/30">
          <div class="text-xl md:text-2xl lg:text-3xl font-bold text-orange-400">{stats.current}</div>
          <div class="text-orange-300 text-xs md:text-sm lg:text-base mt-1">Sedang Ditangani</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-2 md:p-3 text-center border border-yellow-500/30">
          <div class="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400">{stats.skipped}</div>
          <div class="text-yellow-300 text-xs md:text-sm lg:text-base mt-1">Dilewat</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl p-2 md:p-3 text-center border border-amber-500/30">
          <div class="text-xl md:text-2xl lg:text-3xl font-bold text-amber-400">{stats.remaining}</div>
          <div class="text-amber-300 text-xs md:text-sm lg:text-base mt-1">Menunggu</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-2 md:p-3 text-center border border-emerald-500/30">
          <div class="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-400">{stats.served}</div>
          <div class="text-emerald-300 text-xs md:text-sm lg:text-base mt-1">Selesai</div>
        </div>
      </div>
    {/await}
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #0a0a0a;
  }
  
  /* Fullscreen container styles */
  .fullscreen-container:fullscreen {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .fullscreen-container:-webkit-full-screen {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .fullscreen-container:-moz-full-screen {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  :global(.animate-pulse) {
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
      text-shadow: 0 0 10px currentColor;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.9;
      text-shadow: 0 0 20px currentColor;
    }
  }
  
  :global(.animate-bounce) {
    animation: bounce 1s infinite;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  :global(.animate-fade-in) {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  :global(.animate-fade-out) {
    animation: fadeOut 0.5s ease-out forwards;
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.9);
    }
  }
</style>
