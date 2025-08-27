<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import FormInput from "$lib/components/ui/FormInput.svelte";

  export let show = false;
  export let isEditMode = false;
  export let loading = false;

  export let initial = {
    queueId: 0,
    seqNumber: 0,
    status: "PENDING",
  };

  export let queues: {
    id: number;
    name: string;
    code: string;
    ticketPrefix: string;
  }[] = [];

  const dispatch = createEventDispatcher();

  // Bind sebagai string, convert ke number saat submit
  let queueId: string = initial.queueId?.toString() ?? "0";
  let seqNumber: string = initial.seqNumber?.toString() ?? "0";
  let status: string = initial.status ?? "PENDING";

  $: if (show) {
    queueId = initial.queueId?.toString() ?? "0";
    seqNumber = initial.seqNumber?.toString() ?? "0";
    status = initial.status ?? "PENDING";
  }

  function handleSubmit() {
    dispatch("submit", {
      queueId: Number(queueId),
      seqNumber: Number(seqNumber),
      status,
    });
  }

  function handleQueueChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    queueId = target.value;
  }

  const queueSelectId = "ticket-queue-select";
  const statusSelectId = "ticket-status-select";
</script>

<Modal {show} on:close={() => dispatch("close")} size="md">
  <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4 p-6">
    <h2 class="text-2xl font-bold text-center">
      {isEditMode ? "Edit Ticket" : "Tambah Ticket"}
    </h2>

    <div class="space-y-4">
      <!-- Queue select -->
      <div class="form-control">
        <label class="label" for={queueSelectId}>Queue</label>
        <select
          id={queueSelectId}
          bind:value={queueId}
          class="select select-bordered w-full"
          required
        >
          <option value="0">— Pilih Queue —</option>
          {#each queues as q}
            <option value={q.id.toString()}>{q.code} - {q.name}</option>
          {/each}
        </select>
      </div>

      <!-- Seq Number -->
      <FormInput
        label="Seq Number"
        type="number"
        bind:value={seqNumber}
        required
      />

      <!-- Status select -->
      <div class="form-control">
        <label class="label" for={statusSelectId}>Status</label>
        <select
          id={statusSelectId}
          bind:value={status}
          class="select select-bordered w-full"
          required
        >
          <option value="PENDING">PENDING</option>
          <option value="SERVED">SERVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex justify-center gap-4 mt-6">
      <Button type="submit" {loading} className="btn-primary">
        {isEditMode ? "Simpan" : "Tambah"}
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
