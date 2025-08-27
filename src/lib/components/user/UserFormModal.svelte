<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import FormInput from "$lib/components/ui/FormInput.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import FormSelect from "../ui/FormSelect.svelte";

  export let show = false;
  export let isEditMode = false;
  export let loading = false;
  export let isAdmin = false;

  export let queues: { id: number; name: string; code: string }[] = [];

  export let initial = {
    code: "",
    name: "",
    email: "",
    password: "",
    photo: "/uploads/placeholder.png",
    role: null as string | null,
    queueId: null as number | null,
  };

  const dispatch = createEventDispatcher();

  let code = "";
  let name = "";
  let email = "";
  let password = "";
  let file: File | null = null;
  let previewUrl: string | null = null;
  let role: string | null = null;
  let queueId: number | null = null;

  $: if (show) {
    code = initial.code || "";
    name = initial.name || "";
    email = initial.email || "";
    password = "";
    file = null;
    previewUrl = initial.photo || "/uploads/placeholder.png";
    role = initial.role || "";
    queueId = initial.queueId ?? null;
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    file = target?.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleQueueChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    queueId = target.value ? Number(target.value) : null;
  }

  async function handleSubmit() {
    let photoUrl = initial.photo || "/uploads/placeholder.png";

    if (file) {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/users/upload", {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        const result = await res.json();
        photoUrl = result.url;
      }
    }

    const payload: Record<string, any> = {
      code,
      name,
      email,
      photo: photoUrl,
      role,
      queueId,
    };

    if (!isEditMode || password.trim()) {
      payload.password = password;
    }

    dispatch("submit", payload);
  }
</script>

<Modal
  {show}
  size="3xl"
  className="max-w-screen-xl"
  on:close={() => dispatch("close")}
>
  <div class="max-h-[80vh] overflow-y-auto p-4 space-y-6">
    <form on:submit|preventDefault={handleSubmit} class="p-4 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
        <!-- Kolom 1: Nama, Email, Password -->
        <div class="space-y-4">
          <FormInput id="user-name" label="Nama" bind:value={name} required />
          <FormInput
            id="user-email"
            label="Email"
            type="email"
            bind:value={email}
            required
          />
          <FormInput
            id="user-password"
            label="Password"
            type="password"
            bind:value={password}
            required={!isEditMode}
            placeholder={isEditMode ? "(Biarkan kosong jika tidak diubah)" : ""}
          />
        </div>

        <!-- Kolom 2: Kode, Role, Queue -->
        <div class="space-y-4">
          <FormInput id="user-code" label="Kode" bind:value={code} />

          {#if isAdmin}
            <FormSelect
              id="user-role"
              label="Role"
              bind:value={role}
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />

            <FormSelect
              id="user-queue"
              label="Queue"
              bind:value={queueId}
              options={[
                ...queues.map((q) => ({
                  value: q.id,
                  label: `${q.code} - ${q.name}`,
                })),
              ]}
            />
          {/if}
        </div>

        <!-- Baris bawah full-width: Upload Foto -->
        <div class="md:col-span-2 flex flex-col items-center space-y-4 mt-4">
          <div class="form-control w-full">
            <label class="label" for="user-photo">
              <span class="label-text font-medium">Foto (opsional)</span>
            </label>
            <input
              id="user-photo"
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              on:change={handleFileChange}
            />
          </div>

          {#if previewUrl}
            <div class="flex flex-col items-center w-full">
              <p class="text-sm mb-2 text-gray-500 text-center">
                Preview Foto:
              </p>
              <img
                src={previewUrl}
                alt="Preview"
                class="w-40 h-40 rounded-full object-cover border shadow mx-auto"
              />
            </div>
          {/if}
        </div>
      </div>

      <!-- Tombol Aksi -->
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
  </div>
</Modal>
