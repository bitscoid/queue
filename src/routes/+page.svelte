<script lang="ts">
  import AuthLayout from '$lib/layouts/AuthLayout.svelte';
  import LoginForm from '$lib/components/login/LoginForm.svelte';

  function handleSuccess() {
    window.location.href = '/dashboard';
  }

  // Function to navigate to the display page
  function goToDisplay() {
    window.location.href = '/display';
  }

  // Function to navigate to the queue page
  function goToQueue() {
    window.location.href = '/antrian';
  }
</script>

<div class="min-h-screen flex flex-col">
  <nav class="navbar bg-base-100 shadow px-4">
    <div class="navbar-start">
      <a href="/" class="btn btn-ghost normal-case text-lg">
        <span class="font-bold">Riza Antrian</span>
      </a>
    </div>
    <div class="navbar-end">
      <a href="/login" class="btn btn-outline btn-primary">Login Admin</a>
    </div>
  </nav>

  <main class="flex-grow flex flex-col items-center justify-center p-6">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Sistem Antrian Digital</h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Solusi manajemen antrian modern dengan tampilan real-time dan pengambilan tiket otomatis
      </p>
    </div>

    <!-- Navigation Options for Public Pages -->
    <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <a 
        href="/display" 
        class="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center h-64 border border-blue-400/30"
      >
        <div class="text-5xl mb-4">📺</div>
        <h2 class="text-2xl font-bold mb-2">Tampilan Antrian</h2>
        <p class="opacity-90">Lihat status antrian secara real-time</p>
      </a>

      <a 
        href="/antrian" 
        class="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center h-64 border border-emerald-400/30"
      >
        <div class="text-5xl mb-4">🎫</div>
        <h2 class="text-2xl font-bold mb-2">Ambil Antrian</h2>
        <p class="opacity-90">Ambil nomor antrian Anda</p>
      </a>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-base-100 rounded-2xl shadow-lg p-1 border border-base-200">
      <div class="w-full max-w-md p-6 shadow-lg bg-base-100 rounded-xl m-4">
        <h1 class="text-xl font-bold text-center mb-6">Login Admin/Operator</h1>
        <LoginForm on:success={handleSuccess} />
      </div>
    </div>
  </main>

  <footer class="py-6 text-center text-gray-500 text-sm">
    <p>© {new Date().getFullYear()} Riza Antrian - Sistem Manajemen Antrian Digital</p>
  </footer>
</div>