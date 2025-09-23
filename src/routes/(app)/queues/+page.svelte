<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/table/PageHeader.svelte";
  import TableToolbar from "$lib/components/table/TableToolbar.svelte";
  import Pagination from "$lib/components/table/Pagination.svelte";
  import ConfirmModal from "$lib/components/modal/ConfirmModal.svelte";
  import QueueFormModal from "$lib/components/queue/QueueFormModal.svelte";
  import QueueTable from "$lib/components/queue/QueueTable.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte";

  import type { Queue } from "$lib/types";
  import { z } from "zod";
  import { queueSchema } from "$lib/validations/queue";

  export let data: {
    queues: Queue[];
    isAdmin: boolean;
    userQueueId: number | null;
  };

  const { queues: initialQueues, isAdmin, userQueueId } = data;

  let queues = [...initialQueues];
  let searchKeyword = "";
  let currentPage = 1;
  const pageSize = 7;
  let sortKey: keyof Queue = "name";
  let sortDirection: "asc" | "desc" = "asc";

  let showQueueModal = false;
  let isEditMode = false;
  let loading = false;
  let selectedQueue: Queue | null = null;

  let queueToDelete: Queue | null = null;
  const confirmModalId = "delete-queue-confirm";

  // 🔔 Notification state
  let showNotification = false;
  let notifTitle = "";
  let notifMessage = "";
  let notifType: "success" | "error" = "success";

  function notify(type: "success" | "error", title: string, message: string) {
    notifType = type;
    notifTitle = title;
    notifMessage = message;
    showNotification = true;
  }

  let queueForm = {
    code: "",
    name: "",
    ticketPrefix: "",
  };

  // ---------- Helpers ----------
  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: Queue[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof Queue) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  function normalizeQueue(raw: any): Queue {
    return {
      ...raw,
      createdAt: raw.createdAt
        ? new Date(raw.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: raw.updatedAt
        ? new Date(raw.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  }

  // ---------- Modal CRUD ----------
  function openAddModal() {
    isEditMode = false;
    selectedQueue = null;
    queueForm = { code: "", name: "", ticketPrefix: "" };
    showQueueModal = true;
  }

  function openEditModal(queue: Queue) {
    isEditMode = true;
    selectedQueue = queue;
    queueForm = {
      code: queue.code,
      name: queue.name,
      ticketPrefix: queue.ticketPrefix,
    };
    showQueueModal = true;
  }

  function closeFormModal() {
    showQueueModal = false;
  }

  async function onSubmit(payload: typeof queueForm) {
    loading = true;
    try {
      const validated = queueSchema.parse(payload);

      const endpoint =
        isEditMode && selectedQueue
          ? `/api/queues/${selectedQueue.id}`
          : "/api/queues";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        const normalized = normalizeQueue(result);
        if (isEditMode && selectedQueue) {
          queues = queues.map((q) =>
            q.id === selectedQueue!.id ? { ...q, ...normalized } : q
          );
          notify("success", "Berhasil", "Queue berhasil diperbarui ✅");
        } else {
          queues = [...queues, normalized];
          notify("success", "Berhasil", "Queue baru berhasil ditambahkan ✅");
        }
        closeFormModal();
      } else {
        notify(
          "error",
          "Gagal",
          result?.message || result?.error || "Gagal menyimpan data"
        );
        closeFormModal();
      }
    } catch (err) {
      closeFormModal();
      if (err instanceof z.ZodError) {
        notify(
          "error",
          "Validasi Gagal",
          err.issues.map((e) => e.message).join(", ")
        );
      } else {
        notify("error", "Error", "Terjadi kesalahan saat mengirim data");
      }
    } finally {
      loading = false;
    }
  }

  function askDelete(queue: Queue) {
    queueToDelete = queue;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  async function onConfirmDelete() {
    if (!queueToDelete) return;

    const res = await fetch(`/api/queues/${queueToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      queues = queues.filter((q) => q.id !== queueToDelete?.id);
      notify(
        "success",
        "Berhasil",
        `Queue "${queueToDelete?.name}" berhasil dihapus ✅`
      );
    } else {
      notify("error", "Gagal", "Queue gagal dihapus ❌");
    }
    queueToDelete = null;
  }

  // ---------- Reactive ----------
  $: filteredQueues = queues.filter(
    (q) =>
      q.name.toLowerCase().includes(searchKeyword) ||
      q.code.toLowerCase().includes(searchKeyword) ||
      q.ticketPrefix.toLowerCase().includes(searchKeyword)
  );

  $: sortedQueues = [...filteredQueues].sort((a, b) => {
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  $: paginatedQueues = paginate(sortedQueues, currentPage, pageSize);
  
  // Helper function to check if a queue is assigned to the current user
  function isUserQueue(queueId: number) {
    return userQueueId === queueId;
  }
</script>

<DefaultLayout title="Daftar Loket">
  <PageHeader
    title="Daftar Loket"
    icon="📋"
    showAddButton={isAdmin}
    addLabel="Tambah Loket"
    onAdd={openAddModal}
  />

  {#if !isAdmin}
    <div class="alert alert-info mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Anda hanya dapat melihat loket yang ditugaskan kepada Anda. Hubungi administrator jika Anda memerlukan akses ke loket lain.</span>
    </div>
  {/if}

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <QueueTable
    queues={paginatedQueues}
    onEdit={openEditModal}
    onDelete={askDelete}
    {sortKey}
    {sortDirection}
    onSort={toggleSort}
    {isAdmin}
    {userQueueId}
  />

  <Pagination
    totalItems={filteredQueues.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <QueueFormModal
    show={showQueueModal}
    {isEditMode}
    {loading}
    initial={queueForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  {#if isAdmin}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus Queue"
      message={`Yakin ingin menghapus ${queueToDelete?.name ?? ""}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}

  <!-- 🔔 Notification Modal -->
  <NotificationModal
    bind:show={showNotification}
    title={notifTitle}
    message={notifMessage}
    type={notifType}
    onClose={() => (showNotification = false)}
  />
</DefaultLayout>
