<script lang="ts">
  import { onMount, tick } from "svelte";
  import { writable } from "svelte/store";

  type Queue = {
    id: number;
    name: string;
    code: string;
    color?: string;
    current: string[];
    remaining: number;
  };

  const queues = writable<Queue[]>([]);
  const mainTicket = writable<string | null>(null);
  const animatedTicket = writable<string | null>(null);
  const bgGradient = writable<string>("linear-gradient(135deg,#333,#444)");

  let ws: WebSocket;
  let lastTicket: string | null = null;

  onMount(() => {
    ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      queues.set(
        data.queues.map((q: any) => ({
          id: q.id,
          name: q.name,
          code: q.code,
          current: q.current,
          remaining: q.remaining,
          color: getQueueColor(q.code),
        }))
      );

      const activeQueue = data.queues.find((q: any) => q.current.length > 0);
      const newTicket = activeQueue?.current[0] ?? null;

      mainTicket.set(newTicket);
      bgGradient.set(getQueueGradient(activeQueue?.code));

      if (newTicket && newTicket !== lastTicket) {
        lastTicket = newTicket;

        // Play sound
        const audio = new Audio("/sounds/ping.mp3");
        audio.play().catch((err) => console.error(err));

        // Animasi zoom ticket utama
        animatedTicket.set(null);
        await tick();
        animatedTicket.set(newTicket);
      }
    };

    ws.onclose = () => console.log("⚠️ WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  });

  function getQueueColor(code: string) {
    const colors: Record<string, string> = {
      A: "#4caf50",
      B: "#2196f3",
      C: "#ff9800",
      D: "#9c27b0",
      E: "#f44336",
    };
    return colors[code] ?? "#333";
  }

  function getQueueGradient(code?: string) {
    const gradients: Record<string, string> = {
      A: "linear-gradient(135deg,#4caf50,#81c784)",
      B: "linear-gradient(135deg,#2196f3,#64b5f6)",
      C: "linear-gradient(135deg,#ff9800,#ffb74d)",
      D: "linear-gradient(135deg,#9c27b0,#ba68c8)",
      E: "linear-gradient(135deg,#f44336,#e57373)",
    };
    return code ? (gradients[code] ?? "#333") : "#333";
  }
</script>

<div class="container">
  <div class="main" style="background: {$bgGradient}">
    <div class="label">Now Serving</div>
    {#if $animatedTicket}
      <div class="ticket">{$animatedTicket}</div>
    {:else}
      <div class="ticket">-</div>
    {/if}
  </div>
  <div class="sidebar">
    {#each $queues as q}
      <div class="queue">
        <h3 style="color: {q.color}">{q.name} ({q.code})</h3>
        <div>Remaining: {q.remaining}</div>
        {#each q.current as t}
          <div class="ticket-next">{t}</div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: sans-serif;
    overflow: hidden;
  }
  .container {
    display: flex;
    height: 100vh;
    color: #fff;
  }
  .main {
    flex: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: background 1s ease;
  }
  .label {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #ffc107;
  }

  .ticket {
    font-size: 7rem;
    font-weight: bold;
    position: absolute;
    transform: scale(0.5);
    opacity: 0;
    animation: zoomIn 0.6s forwards;
  }

  @keyframes zoomIn {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .sidebar {
    flex: 1;
    padding: 1rem;
    background: #111;
    overflow-y: auto;
  }
  .queue {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-bottom: 1px solid #444;
  }
  .queue h3 {
    margin: 0 0 0.5rem 0;
  }
  .ticket-next {
    opacity: 0;
    transform: translateY(-20%);
    animation: slideDown 0.5s forwards;
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
  }
  @keyframes slideDown {
    0% {
      opacity: 0;
      transform: translateY(-20%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }
</style>
