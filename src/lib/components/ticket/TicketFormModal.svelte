<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import FormSelect from "$lib/components/ui/FormSelect.svelte";
  import type { Queue, TicketStatus } from "$lib/types";

  export let show = false;
  export let mode: "add" | "edit" | "reset" = "add";
  export let loading = false;
  export let initial: { queueId: number; status?: TicketStatus } = {
    queueId: 0,
  };
  export let queues: Queue[] = [];

  const dispatch = createEventDispatcher();

  // queueId hanya dipakai untuk add/reset
  let queueId: string = initial.queueId?.toString() ?? "0";
  $: if (show && (mode === "add" || mode === "reset"))
    queueId = initial.queueId?.toString() ?? "0";

  // status hanya dipakai untuk edit
  let status: TicketStatus = initial.status ?? "PENDING";
  $: if (show && mode === "edit") status = initial.status ?? "PENDING";

  $: options = queues.map((q) => ({
    value: q.id.toString(),
    label: `${q.code} - ${q.name}`,
  }));

  $: modalTitle =
    mode === "add"
      ? "Ambil Ticket"
      : mode === "edit"
        ? "Edit Ticket"
        : "Reset Sequence Tiket";

  $: submitLabel =
    mode === "add"
      ? "Ambil Antrian"
      : mode === "edit"
        ? "Update Status"
        : "Reset Sequence";

  function handleSubmit() {
    if ((mode === "add" || mode === "reset") && !queueId) return;

    const payload: { queueId?: number; status?: TicketStatus } = {};
    if (mode === "add" || mode === "reset") payload.queueId = Number(queueId);
    if (mode === "edit") payload.status = status;

    dispatch("submit", payload);
  }
</script>

<Modal {show} on:close={() => dispatch("close")} size="md">
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4 p-6">
    <h2 class="text-2xl font-bold text-center">{modalTitle}</h2>

    {#if mode === "add" || mode === "reset"}
      <FormSelect
        id="ticket-queue-select"
        label="Pilih Queue"
        bind:value={queueId}
        {options}
        required
      />
    {/if}

    {#if mode === "edit"}
      <FormSelect
        id="ticket-status-select"
        label="Pilih Status"
        bind:value={status}
        options={[
          { value: "PENDING", label: "PENDING" },
          { value: "CALLED", label: "CALLED" },
          { value: "SERVING", label: "SERVING" },
          { value: "SKIPPED", label: "SKIPPED" },
          { value: "COMPLETED", label: "COMPLETED" },
          { value: "CANCELLED", label: "CANCELLED" },
        ]}
        required
      />
    {/if}

    <div class="flex justify-center gap-4 mt-6">
      <Button
        type="submit"
        {loading}
        className={mode === "reset" ? "btn-warning" : "btn-primary"}
      >
        {submitLabel}
      </Button>
      <Button
        type="button"
        className="btn-outline"
        on:click={() => dispatch("close")}
      >
        Batal
      </Button>
    </div>
  </form>
</Modal>
