<script lang="ts">
  import type { PageData } from "./$types";
  import type { ActionResult } from "@sveltejs/kit";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";

  export let data: PageData & {
    queues: { id: number; name: string; code: string; ticketPrefix: string }[];
    logo: string | null;
    name: string;
    description: string;
  };

  let lastTicket: {
    id: number;
    fullNumber: string;
    date: string;
    queue: { name: string; ticketPrefix: string };
  } | null = null;

  // waktu realtime
  let now = new Date();
  const updateClock = () => {
    now = new Date();
    setTimeout(updateClock, 1000);
  };
  updateClock();

  function formatDate(d: Date) {
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function handleEnhance() {
    return async ({
      result,
    }: {
      formData: FormData;
      formElement: HTMLFormElement;
      action: URL;
      result: ActionResult;
      update: (opts?: { reset?: boolean }) => Promise<void>;
    }) => {
      if (
        result?.type === "success" &&
        result?.data?.success &&
        result?.data?.ticket
      ) {
        lastTicket = result.data.ticket;
        await tick();
        window.print();
      }
    };
  }
</script>

<svelte:head>
  <title>Ambil Nomor Antrian</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col items-center justify-start px-4 py-6 bg-base-200"
>
  <!-- Header toko -->
  <div class="text-center mb-6">
    {#if data.logo}
      <img src={data.logo} alt="Logo" class="mx-auto w-16 h-16 mb-2" />
    {/if}
    <h1 class="text-3xl font-bold">{data.name}</h1>
    <p class="text-sm text-base-content/70">{data.description}</p>
  </div>

  <!-- Waktu -->
  <div class="text-center mb-8">
    <div class="text-lg font-semibold">{formatDate(now)}</div>
    <div class="text-2xl font-mono">{formatTime(now)}</div>
  </div>

  <!-- Pilih Layanan -->
  <div class="w-full max-w-5xl">
    <h2 class="text-2xl font-bold text-center mb-4">Silakan pilih layanan</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {#each data.queues as q}
        <form
          method="POST"
          use:enhance={handleEnhance}
          class="card bg-base-100 shadow-xl border border-base-300 hover:scale-105 transition-transform"
        >
          <div class="card-body items-center text-center">
            <div class="text-5xl">🎫</div>
            <h3 class="card-title mt-2">{q.name}</h3>
            <input type="hidden" name="queueId" value={q.id} />
            <button
              class="btn btn-primary btn-wide text-lg"
              name="take"
              formaction="?/take"
            >
              Ambil Nomor
            </button>
          </div>
        </form>
      {/each}
    </div>
  </div>
</div>

<!-- Area print -->
<div class="print-area">
  {#if lastTicket}
    <div class="ticket">
      {#if data.logo}
        <img src={data.logo} alt="Logo" class="logo" />
      {/if}
      {#if data.name}
        <div class="brand">{data.name}</div>
      {/if}
      {#if data.description}
        <div class="address">{data.description}</div>
      {/if}

      <div class="title">{lastTicket.queue.name}</div>
      <div class="number">{lastTicket.fullNumber}</div>
      <div class="date">
        {new Date(lastTicket.date).toLocaleString("id-ID")}
      </div>
      <div class="note">
        Silakan tunggu panggilan untuk {lastTicket.queue.name}.
      </div>
    </div>
  {/if}
</div>

<style>
  .print-area {
    display: none;
  }

  @media print {
    @page {
      size: 58mm auto;
      margin: 2mm;
    }
    :global(body) * {
      visibility: hidden;
    }
    .print-area,
    .print-area * {
      visibility: visible;
    }

    .print-area {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 58mm;
      text-align: center;
      font-family: monospace, sans-serif;
    }

    .ticket .logo {
      width: 40px;
      height: 40px;
      margin-bottom: 4px;
    }
    .ticket .brand {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .ticket .address {
      font-size: 11px;
      margin-bottom: 6px;
    }
    .ticket .title {
      font-size: 12px;
      margin-bottom: 4px;
    }
    .ticket .number {
      font-size: 28px;
      font-weight: bold;
      margin: 6px 0;
    }
    .ticket .date {
      font-size: 11px;
      margin-bottom: 4px;
    }
    .ticket .note {
      font-size: 11px;
      margin-top: 6px;
    }
  }
</style>
