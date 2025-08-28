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
  import type { Ticket } from "$lib/types";

  let queues: Queue[] = [];
  let lastTicket: Ticket | null = null;
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

  const colors = ["#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#9b59b6"];

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
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 2px; 
          }
          .ticket-number { 
            font-size: 28px; 
            font-weight: bold; 
            margin: 6px 0; 
          }
          .ticket-queue {
            font-size: 14px;
            margin-bottom: 4px;
          }
          .ticket-date { 
            font-size: 11px; 
            margin-bottom: 6px;
          }
          .separator {
            font-size: 12px;
            margin: 4px 0;
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
          <div class="separator">------------------------------</div>
          <div class="ticket-number">${
            (document.querySelector(".ticket-number") as HTMLElement)
              ?.textContent ?? ""
          }</div>
          <div class="separator">------------------------------</div>
          <div class="ticket-queue">${
            (document.querySelector(".ticket-queue") as HTMLElement)
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
  class="min-h-screen flex flex-col items-center justify-start px-4 py-6 bg-orangered text-white"
>
  <!-- Header -->
  <div class="text-center mb-6">
    {#if setting.logo}
      <img src={setting.logo} alt="Logo" class="mx-auto w-20 h-20 mb-2" />
    {/if}
    <h1 class="text-5xl font-bold">{setting.name}</h1>
    <p class="text-xl p-4">{setting.description}</p>
  </div>

  <!-- Jam Digital -->
  <div class="text-center mb-6">
    <div class="text-xl font-semibold">{formatDate(now)}</div>
    <div class="text-5xl font-mono">{formatTime(now)}</div>
  </div>

  <!-- Petunjuk -->
  <div
    class="instruction-box mb-6 text-center px-6 py-4 rounded-lg bg-white text-black shadow-md max-w-3xl"
  >
    <h2 class="text-2xl font-bold mb-2">Cara Mengambil Nomor Antrian</h2>
    <p class="text-lg">
      Silakan pilih layanan di bawah untuk mendapatkan nomor antrian Anda.
    </p>
  </div>

  <!-- Pilih Layanan -->
  <div class="w-full max-w-6xl">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {#each queues as q, i}
        <button
          type="button"
          class="service-card"
          style="background-color: {colors[i % colors.length]}"
          on:click={() => takeTicket(q.id)}
        >
          <div class="card-body items-center text-center">
            <div class="text-6xl">🎫</div>
            <h3 class="text-2xl font-bold mt-2">{q.name}</h3>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Popup Tiket -->
{#if showTicket && lastTicket}
  <div class="ticket-popup" transition:fade={{ duration: 200 }}>
    <div class="ticket-content bg-white text-black shadow-xl">
      {#if setting.logo}
        <img src={setting.logo} alt="Logo" class="ticket-logo" />
      {/if}
      <div class="ticket-brand">{setting.name}</div>

      <div class="ticket-number">{lastTicket.fullNumber}</div>

      <div class="ticket-queue">
        {queues.find((q) => q.id === lastTicket!.queueId)?.name}
      </div>

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
  .bg-orangered {
    background-color: #e74c3c;
  }

  .service-card {
    border-radius: 1rem;
    padding: 2rem;
    color: white;
    font-family: sans-serif;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    cursor: pointer;
    width: 100%;
    height: 180px;
  }
  .service-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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
    width: 60px;
    height: 60px;
    margin-bottom: 0.5rem;
  }
  .ticket-brand {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .ticket-number {
    font-size: 50px;
    font-weight: bold;
    margin: 0.5rem 0;
  }
  .ticket-queue {
    font-size: 22px;
    margin-bottom: 0.5rem;
  }
  .ticket-date {
    font-size: 18px;
    color: #555;
  }

  @keyframes pop-in {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .instruction-box {
    font-family: "Poppins", sans-serif;
    text-align: center;
    border-radius: 1rem;
    padding: 1.5rem 2rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    color: #000;
  }
  .instruction-box h2 {
    color: #e74c3c;
  }

  .ticket-content {
    padding: 2rem 3rem;
    border-radius: 1rem;
    text-align: center;
    font-family: monospace, sans-serif;
    animation: pop-in 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ticket-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 0.5rem;
  }
</style>
