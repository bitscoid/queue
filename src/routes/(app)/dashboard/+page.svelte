<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";

  export let data;
  const { 
    user, 
    users, 
    tokens, 
    queues, 
    totalOperators,
    totalTicketsToday,
    pendingTickets,
    servingTickets,
    completedTickets,
    calledTickets,
    skippedTickets,
    cancelledTickets,
    operatorStats,
    queueStats,
    mostActiveQueue
  } = data;

  // Define ticket status colors to use for operator cards
  const statusColors = [
    'bg-blue-50 border-blue-200 text-blue-800',    // PENDING - matches 'Menunggu'
    'bg-amber-50 border-amber-200 text-amber-800', // SERVING - matches 'Sedang Ditangani'
    'bg-purple-50 border-purple-200 text-purple-800', // CALLED - matches 'Dipanggil'
    'bg-emerald-50 border-emerald-200 text-emerald-800', // COMPLETED - matches 'Selesai'
    'bg-yellow-50 border-yellow-200 text-yellow-800', // SKIPPED - matches 'Dilewat'
    'bg-gray-50 border-gray-200 text-gray-800'  // CANCELLED - matches 'Dibatalkan'
  ];

  function getOperatorCardClasses(index: number) {
    const colorClass = statusColors[index % statusColors.length];
    return `p-4 rounded-xl shadow-sm border ${colorClass}`;
  }

  const totalUsers = users.length;
  const totalTokens = tokens.length;
  const totalQueues = queues.length;
  const completedPercentage = totalTicketsToday > 0 ? Math.round((completedTickets / totalTicketsToday) * 100) : 0;
</script>

<DefaultLayout title="Dashboard">
  <div class="p-6 w-full space-y-8">
    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg rounded-2xl p-5 border border-blue-400/30">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">🎫</div>
          <div>
            <div class="text-2xl font-bold">{totalTicketsToday}</div>
            <div class="text-sm opacity-80">Antrian Hari Ini</div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg rounded-2xl p-5 border border-emerald-400/30">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">✅</div>
          <div>
            <div class="text-2xl font-bold">{completedTickets}</div>
            <div class="text-sm opacity-80">Selesai Ditangani</div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg rounded-2xl p-5 border border-amber-400/30">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">⏳</div>
          <div>
            <div class="text-2xl font-bold">{servingTickets}</div>
            <div class="text-sm opacity-80">Sedang Ditangani</div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg rounded-2xl p-5 border border-indigo-400/30">
        <div class="flex items-center space-x-4">
          <div class="text-2xl">👥</div>
          <div>
            <div class="text-2xl font-bold">{totalOperators}</div>
            <div class="text-sm opacity-80">Total Operator</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Operator Stats -->
      <div class="lg:col-span-2 bg-base-100 shadow-md rounded-2xl p-6 border border-base-200">
        <h2 class="text-xl font-bold mb-4">Statistik Operator</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each operatorStats as operator, index}
            <div class="{getOperatorCardClasses(index)}">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold">{operator.name}</div>
                </div>
                <div class="text-2xl font-bold">{operator._count.tickets}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="bg-base-100 shadow-md rounded-2xl p-6 border border-base-200">
        <h2 class="text-xl font-bold mb-4">Status Antrian</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Menunggu</span>
            </div>
            <span class="font-semibold">{pendingTickets}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Sedang Ditangani</span>
            </div>
            <span class="font-semibold">{servingTickets}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Dipanggil</span>
            </div>
            <span class="font-semibold">{calledTickets}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Selesai</span>
            </div>
            <span class="font-semibold">{completedTickets}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Dilewat</span>
            </div>
            <span class="font-semibold">{skippedTickets}</span>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex justify-between mb-2">
            <span>Presentase Penyelesaian</span>
            <span class="font-semibold">{completedPercentage}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              class="bg-emerald-600 h-2.5 rounded-full" 
              style="width: {completedPercentage}%"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</DefaultLayout>
