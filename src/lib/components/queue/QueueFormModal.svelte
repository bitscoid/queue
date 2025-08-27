<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import FormInput from "$lib/components/ui/FormInput.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";

  export let show = false;
  export let isEditMode = false;
  export let loading = false;

  export let initial = {
    code: "",
    name: "",
    ticketPrefix: "",
  };

  const dispatch = createEventDispatcher();

  let code = "";
  let name = "";
  let ticketPrefix = "";

  // reset state saat modal dibuka
  $: if (show) {
    code = initial.code || "";
    name = initial.name || "";
    ticketPrefix = initial.ticketPrefix || "";
  }

  function handleSubmit() {
    const payload = {
      code,
      name,
      ticketPrefix,
    };
    dispatch("submit", payload);
  }
</script>

<Modal {show} on:close={() => dispatch("close")} size="md">
  <form
    on:submit|preventDefault={handleSubmit}
    class="w-full p-6 flex flex-col"
  >
    <h2 class="text-2xl font-bold mb-6 text-center">
      {isEditMode ? "Edit Queue" : "Tambah Queue"}
    </h2>

    <div class="space-y-4">
      <FormInput label="Kode" bind:value={code} required />
      <FormInput label="Nama" bind:value={name} required />
      <FormInput label="Ticket Prefix" bind:value={ticketPrefix} required />
    </div>

    <div class="flex justify-center gap-4 mt-8">
      <Button type="submit" className="btn-primary" {loading}>
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
