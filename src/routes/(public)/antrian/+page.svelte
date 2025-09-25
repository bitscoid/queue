<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { getQueues } from "$lib/client/services/queue.client";
  import { createTicket } from "$lib/client/services/ticket.client";
  import {
    getSetting,
    type Setting,
  } from "$lib/client/services/setting.client";
  import type { Queue } from "$lib/client/stores/queue.store";
  import type { TicketDisplay } from "$lib/types";

  let queues: Queue[] = [];
  let lastTicket: TicketDisplay | null = null;
  let showTicket = false;

  let setting: Setting = {
    logo: null,
    name: "Aplikasi Antrian",
    description: "",
  };

  // Jam digital
  let now = new Date();
  const updateClock = () => {
    now = new Date();
    setTimeout(updateClock, 1000);
  };
  updateClock();

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Ambil data antrian & setting
  onMount(async () => {
    try {
      queues = await getQueues();
      setting = await getSetting();
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  });

  // Fungsi ambil tiket
  async function takeTicket(queueId: number) {
    try {
      const ticket = await createTicket(queueId);
      lastTicket = ticket;
      showTicket = true;
      await tick(); // pastikan DOM update

      // Auto hide popup setelah 5 detik
      setTimeout(() => {
        showTicket = false;
      }, 5000);

      // Tunggu sebentar biar tiket render dulu
      setTimeout(() => {
        printTicket();
      }, 300);
    } catch (err) {
      console.error("Gagal ambil tiket:", err);
      alert("Gagal mengambil tiket, silakan coba lagi.");
    }
  }

  // Fungsi print via iframe
  function printTicket() {
    const ticketEl = document.querySelector(".ticket-content") as HTMLElement;
    if (!ticketEl) return;

    const printContents = ticketEl.outerHTML;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
    <html>
      <head>
        <style>
          body {
            font-family: monospace, sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
          }
          .ticket-content { 
            width: 220px; /* 58mm */
            margin: 0 auto;
            padding: 6px 0;
          }
          .ticket-logo {
            width: 50px;
            height: 50px;
            margin: 0 auto 6px;
            display: block;
          }
          .ticket-brand { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 2px; 
          }
          .ticket-number { 
            font-size: 128px; 
            font-weight: bold; 
            margin: 1px 0; 
          }
          .ticket-queue {
            font-size: 24px;
            margin-bottom: 4px;
          }
          .ticket-date { 
            font-size: 10px; 
            margin-bottom: 6px;
          }
          .ticket-time { 
            font-size: 10px; 
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>
        <div class="ticket-content">
          <div class="ticket-logo">
            ${
              (document.querySelector(".ticket-logo") as HTMLElement)
                ?.outerHTML ?? ""
            }
          </div>
          <div class="ticket-brand">${
            (document.querySelector(".ticket-brand") as HTMLElement)
              ?.textContent ?? ""
          }</div>
          <div class="ticket-number">${
            (document.querySelector(".ticket-number") as HTMLElement)
              ?.textContent ?? ""
          }</div>
          <div class="ticket-date">${formatDate(new Date(lastTicket!.date))}</div>
          <div class="ticket-time">${formatTime(new Date(lastTicket!.date))}</div>
        </div>
      </body>
    </html>
  `);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => document.body.removeChild(iframe), 1000);
  }
</script>

<svelte:head>
  <title>Ambil Nomor Antrian</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"
>
  <!-- Header -->
  <div class="text-center mb-10">
    {#if setting.logo}
      <img src={setting.logo} alt="Logo" class="mx-auto w-28 h-28 mb-5" />
    {/if}
  </div>

  <!-- Jam Digital -->
  <div class="text-center mb-14">
    <div class="text-2xl font-medium text-gray-700 tracking-wide">{formatDate(now)}</div>
    <div class="text-6xl font-mono font-bold mt-3 text-gray-900 tracking-tighter">{formatTime(now)}</div>
  </div>

  <!-- Tombol Layanan Besar -->
  <div class="w-full max-w-6xl">
    {#if queues.length === 1}
      <!-- Single service - center it -->
      <div class="flex justify-center">
        <button
          type="button"
          class="service-card group focus:outline-none focus:ring-4 focus:ring-orange-200 max-w-2xl w-full"
          on:click={() => takeTicket(queues[0].id)}
        >
          <div class="card-body items-center text-center">
            <div class="text-8xl mb-4 group-hover:scale-110 transition-transform duration-300">🎫</div>
            <div class="ticket-button">
              <span class="font-bold text-lg">Ambil Tiket</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    {:else}
      <!-- Multiple services - grid layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each queues as q, i}
          <button
            type="button"
            class="service-card group focus:outline-none focus:ring-4 focus:ring-orange-200"
            on:click={() => takeTicket(q.id)}
          >
            <div class="card-body items-center text-center">
              <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎫</div>
              <h3 class="text-2xl font-bold mb-3 text-gray-800">{q.name}</h3>
              <div class="ticket-button">
                <span class="font-bold text-lg">Ambil Tiket</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Popup Tiket -->
{#if showTicket && lastTicket}
  <div class="ticket-popup" transition:fade={{ duration: 200 }}>
    <div class="ticket-content bg-white text-black shadow-2xl">
      {#if setting.logo}
        <img src={setting.logo} alt="Logo" class="ticket-logo" />
      {/if}
      <div class="ticket-brand">{setting.name}</div>

      <div class="ticket-number">{lastTicket.fullNumber}</div>

      <div class="ticket-date">
        {formatDate(new Date(lastTicket.date))}
      </div>
      <div class="ticket-time">
        {formatTime(new Date(lastTicket.date))}
      </div>
    </div>
  </div>
{/if}

<style>
  .service-card {
    border-radius: 1.5rem;
    padding: 2.5rem 2rem;
    background: white;
    color: #333;
    font-family: sans-serif;
    transition:
      all 0.3s ease;
    cursor: pointer;
    width: 100%;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid #f0f0f0;
    touch-action: manipulation; /* Better touch response */
  }
  
  .service-card:hover, .service-card:focus {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #FFA500;
  }
  
  .service-card:active {
    transform: translateY(0);
  }
  
  .ticket-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to right, #FF8C00, #FFA500);
    color: white;
    padding: 1rem 2rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 1.1rem;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
    min-width: 200px; /* Better touch target */
    min-height: 60px; /* Better touch target */
    box-shadow: 0 4px 10px rgba(255, 140, 0, 0.2);
  }
  
  .service-card:hover .ticket-button, .service-card:focus .ticket-button {
    background: linear-gradient(to right, #ff7700, #ff9500);
    box-shadow: 0 6px 15px rgba(255, 140, 0, 0.4);
  }
  
  .service-card:active .ticket-button {
    transform: scale(0.98);
  }

  .ticket-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
  }
  .ticket-content {
    padding: 2rem 3rem;
    border-radius: 1rem;
    text-align: center;
    font-family: monospace, sans-serif;
    animation: pop-in 0.3s ease;
  }
  .ticket-logo {
    width: 50px;
    height: 50px;
    margin: 0 auto 6px;
    display: block;
  }
  .ticket-brand { 
    font-size: 24px; 
    font-weight: bold; 
    margin-bottom: 2px; 
  }
  .ticket-number { 
    font-size: 128px; 
    font-weight: bold; 
    margin: 1px 0; 
  }
  .ticket-date { 
    font-size: 10px; 
    margin-bottom: 6px;
  }
  .ticket-time { 
    font-size: 10px; 
    margin-bottom: 6px;
  }

  .ticket-content {
    padding: 2.5rem 3.5rem;
    border-radius: 1.5rem;
    text-align: center;
    font-family: 'Segoe UI', system-ui, sans-serif;
    animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .ticket-logo {
    width: 90px;
    height: 90px;
    margin-bottom: 0.75rem;
  }
  
  .ticket-brand { 
    font-size: 28px; 
    font-weight: 800; 
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }
  
  .ticket-number { 
    font-size: 100px; 
    font-weight: 900; 
    margin: 8px 0;
    letter-spacing: -0.05em;
    background: linear-gradient(to right, #333, #000);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .ticket-date { 
    font-size: 14px; 
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
  }
  
  .ticket-time { 
    font-size: 14px; 
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
  }

  @keyframes pop-in {
    0% {
      transform: scale(0.3) translateY(50px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
</style>
