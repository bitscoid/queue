<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import TicketTable from "$lib/components/ticket/TicketTable.svelte";
  import TableToolbar from "$lib/components/table/TableToolbar.svelte";
  import TicketFormModal from "$lib/components/ticket/TicketFormModal.svelte";
  import Pagination from "$lib/components/table/Pagination.svelte";
  import ValidationModal from "$lib/components/modal/ValidationModal.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte";
  import ConfirmModal from "$lib/components/modal/ConfirmModal.svelte";

  import { tick, onMount } from "svelte";
  import type { Ticket, TicketDisplay, Queue, TicketStatus } from "$lib/types";
  import { z } from "zod";
  import {
    createTicket,
    updateTicket,
  } from "$lib/client/services/ticket.client";

  export let data: {
    tickets: Ticket[];
    isAdmin: boolean;
    currentUserId: number;
  };

  const { tickets: initialTickets, isAdmin, currentUserId } = data;

  let tickets: TicketDisplay[] = initialTickets.map(normalizeTicket);
  let queues: Queue[] = [];
  let ticketToDelete: TicketDisplay | null = null;
  let selectedTicket: TicketDisplay | null = null;
  let showTicketModal = false;
  let showResetModal = false;
  let modalMode: "add" | "edit" | "reset" = "add";
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-ticket-confirm";
  let searchKeyword = "";
  let sortKey: keyof TicketDisplay = "fullNumber";
  let sortDirection: "asc" | "desc" = "asc";
  let ticketForm: { queueId: number; status?: TicketStatus } = { queueId: 0 };
  let resetForm: { queueId: number } = { queueId: 0 };

  let validationMessages: string[] = [];
  let showValidationModal = false;
  let showNotification = false;
  let notifTitle = "";
  let notifMessage = "";
  let notifType: "success" | "error" | "info" = "success";

  function notify(
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) {
    notifType = type;
    notifTitle = title;
    notifMessage = message;
    showNotification = true;
  }

  function normalizeTicket(raw: Ticket): TicketDisplay {
    return {
      id: raw.id,
      fullNumber:
        raw.fullNumber ??
        `${raw.seqNumber}`,
      status: raw.status,
      date: raw.date instanceof Date ? raw.date.toISOString() : raw.date,
      createdAt:
        raw.createdAt instanceof Date
          ? raw.createdAt.toISOString()
          : raw.createdAt,
      updatedAt:
        raw.updatedAt instanceof Date
          ? raw.updatedAt.toISOString()
          : raw.updatedAt,
      queueId: raw.queueId,
      queueName:
        raw.queue?.name ?? queues.find((q) => q.id === raw.queueId)?.name ?? "", // fallback ke queues
      seqNumber: raw.seqNumber,
      servedById: raw.servedByUserId ?? null,
      servedByName: raw.servedByUser?.name ?? "",
    };
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: TicketDisplay[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof TicketDisplay) {
    if (sortKey === key)
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  function openAddModal() {
    modalMode = "add";
    selectedTicket = null;
    ticketForm = { queueId: 0 };
    showTicketModal = true;
  }

  function openEditModal(ticket: TicketDisplay) {
    modalMode = "edit";
    selectedTicket = ticket;
    ticketForm = { queueId: ticket.queueId, status: ticket.status };
    showTicketModal = true;
  }

  function openResetModal() {
    modalMode = "reset";
    resetForm = { queueId: 0 };
    showResetModal = true;
  }

  function closeFormModal() {
    showTicketModal = false;
  }
  function closeResetModal() {
    showResetModal = false;
  }
  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function loadQueues() {
    const res = await fetch("/api/queues");
    queues = await res.json();
  }

  async function onSubmit(payload: {
    queueId?: number;
    status?: TicketStatus;
  }) {
    loading = true;
    try {
      if (modalMode === "add" && payload.queueId) {
        const newTicket = await createTicket(payload.queueId);

        // normalisasi dan pastikan queueName langsung ada
        const ticketDisplay = newTicket;

        // assign ulang array untuk reaktivitas
        tickets = [...tickets, ticketDisplay];

        notify(
          "success",
          "Berhasil",
          `Ticket ${ticketDisplay.fullNumber} ditambahkan ✅`
        );
      } else if (modalMode === "edit" && selectedTicket && payload.status) {
        const updated = await updateTicket(selectedTicket.id, {
          status: payload.status,
        });
        const updatedDisplay = updated;

        // assign ulang array
        tickets = tickets.map((t) =>
          t.id === selectedTicket!.id ? updatedDisplay : t
        );

        notify(
          "success",
          "Berhasil",
          `Ticket ${updatedDisplay.fullNumber} diperbarui ✅`
        );
      } else if (modalMode === "reset" && payload.queueId) {
        await onResetSequence({ queueId: payload.queueId });
      }

      closeFormModal();
    } catch (err) {
      await tick();
      validationMessages =
        err instanceof z.ZodError
          ? err.issues.map((e) => e.message)
          : ["Terjadi kesalahan"];
      showValidationModal = true;
    } finally {
      loading = false;
    }
  }

  async function onResetSequence(payload: { queueId: number }) {
    if (payload.queueId <= 0) return;
    loading = true;
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok)
        notify("success", "Berhasil", "Sequence tiket berhasil direset ✅");
      else notify("error", "Gagal", "Reset sequence gagal ❌");
    } catch {
      notify("error", "Gagal", "Terjadi kesalahan saat reset sequence ❌");
    } finally {
      loading = false;
      showResetModal = false;
    }
  }

  function askDelete(ticket: TicketDisplay) {
    ticketToDelete = ticket;
    setTimeout(() => document.getElementById(confirmModalId)?.click(), 0);
  }

  async function onConfirmDelete() {
    if (!ticketToDelete) return;
    const res = await fetch(`/api/tickets/${ticketToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) tickets = tickets.filter((t) => t.id !== ticketToDelete?.id);
    ticketToDelete = null;
  }

  $: filteredTickets = tickets.filter((t) =>
    (t.fullNumber ?? "").toLowerCase().includes(searchKeyword)
  );
  $: sortedTickets = [...filteredTickets].sort((a, b) =>
    typeof a[sortKey] === "string"
      ? sortDirection === "asc"
        ? (a[sortKey] as string).localeCompare(b[sortKey] as string)
        : (b[sortKey] as string).localeCompare(a[sortKey] as string)
      : 0
  );
  $: paginatedTickets = paginate(sortedTickets, currentPage, pageSize);

  onMount(loadQueues);
</script>

<DefaultLayout title="Tickets">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold flex items-center gap-2">🎫 Tickets</h1>
    {#if isAdmin}
      <div class="flex gap-2">
        <button class="btn btn-primary" on:click={openAddModal}>Tambah</button>
        <button class="btn btn-warning" on:click={openResetModal}
          >Reset Sequence</button
        >
      </div>
    {/if}
  </div>

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <TicketTable
    tickets={paginatedTickets}
    onEdit={(t) => isAdmin && openEditModal(t)}
    onDelete={(t) => isAdmin && askDelete(t)}
    {sortKey}
    {sortDirection}
    {isAdmin}
    onSort={toggleSort}
  />

  <Pagination
    totalItems={filteredTickets.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <TicketFormModal
    show={showTicketModal}
    mode={modalMode}
    {loading}
    initial={ticketForm}
    {queues}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  <TicketFormModal
    show={showResetModal}
    mode="reset"
    {loading}
    initial={resetForm}
    {queues}
    on:submit={(e) => onResetSequence(e.detail)}
    on:close={closeResetModal}
  />

  <ValidationModal
    show={showValidationModal}
    title="Validasi Gagal"
    messages={validationMessages}
    onClose={closeValidationModal}
  />

  <NotificationModal
    bind:show={showNotification}
    title={notifTitle}
    message={notifMessage}
    type={notifType}
    onClose={() => (showNotification = false)}
  />

  {#if isAdmin}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus Ticket"
      message={`Yakin ingin menghapus ${ticketToDelete?.fullNumber}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>
