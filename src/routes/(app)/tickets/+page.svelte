<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import TicketTable from "$lib/components/ticket/TicketTable.svelte";
  import TableToolbar from "$lib/components/table/TableToolbar.svelte";
  import TicketFormModal from "$lib/components/ticket/TicketFormModal.svelte";
  import PageHeader from "$lib/components/table/PageHeader.svelte";
  import Pagination from "$lib/components/table/Pagination.svelte";
  import ConfirmModal from "$lib/components/modal/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/modal/ValidationModal.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte";

  import { ticketSchema } from "$lib/validations/ticket";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { Ticket, TicketDisplay } from "$lib/types";

  export let data: {
    tickets: Ticket[];
    isAdmin: boolean;
    currentUserId: number;
  };

  const { tickets: initialTickets, isAdmin, currentUserId } = data;

  // 🔹 Normalisasi Ticket → TicketDisplay
  let tickets: TicketDisplay[] = initialTickets.map(normalizeTicket);
  let ticketToDelete: TicketDisplay | null = null;
  let selectedTicket: TicketDisplay | null = null;
  let showTicketModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-ticket-confirm";
  let searchKeyword = "";
  let sortKey: keyof TicketDisplay = "fullNumber";
  let sortDirection: "asc" | "desc" = "asc";

  let ticketForm = {
    queueId: 0,
    seqNumber: 0,
    status: "PENDING",
  };

  // --- Validation Modal ---
  let validationMessages: string[] = [];
  let showValidationModal = false;

  // --- Notification Modal ---
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

  // ---------- Helpers ----------
  function normalizeTicket(raw: Ticket): TicketDisplay {
    return {
      id: raw.id,
      fullNumber:
        raw.fullNumber ??
        `${raw.queue?.ticketPrefix}-${String(raw.seqNumber).padStart(3, "0")}`,
      status: raw.status,
      date: raw.date
        ? new Date(raw.date).toISOString()
        : new Date().toISOString(),
      createdAt: new Date(raw.createdAt).toISOString(),
      updatedAt: new Date(raw.updatedAt).toISOString(),
      queueId: raw.queueId,
      queueName: raw.queue?.name ?? "",
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
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  // ---------- Modal CRUD ----------
  function openAddModal() {
    isEditMode = false;
    selectedTicket = null;
    ticketForm = { queueId: 0, seqNumber: 0, status: "PENDING" };
    showTicketModal = true;
  }

  function openEditModal(ticket: TicketDisplay) {
    isEditMode = true;
    selectedTicket = ticket;
    ticketForm = {
      queueId: ticket.queueId,
      seqNumber: ticket.seqNumber,
      status: ticket.status,
    };
    showTicketModal = true;
  }

  function closeFormModal() {
    showTicketModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof ticketForm) {
    loading = true;
    validationMessages = [];

    try {
      const validated = ticketSchema.parse(payload);

      const endpoint =
        isEditMode && selectedTicket
          ? `/api/tickets/${selectedTicket.id}`
          : "/api/tickets";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        const normalized = normalizeTicket(result as Ticket);
        if (isEditMode && selectedTicket) {
          tickets = tickets.map((t) =>
            t.id === selectedTicket!.id ? { ...t, ...normalized } : t
          );
          notify(
            "success",
            "Berhasil",
            `Ticket ${normalized.fullNumber} diperbarui ✅`
          );
        } else {
          tickets = [...tickets, normalized];
          notify(
            "success",
            "Berhasil",
            `Ticket ${normalized.fullNumber} ditambahkan ✅`
          );
        }
        closeFormModal();
      } else {
        closeFormModal();
        await tick();
        validationMessages = [
          result?.message || result?.error || "Gagal menyimpan data",
        ];
        showValidationModal = true;
      }
    } catch (err) {
      closeFormModal();
      await tick();
      if (err instanceof z.ZodError) {
        validationMessages = err.issues.map((e) => e.message);
      } else {
        validationMessages = ["Terjadi kesalahan saat mengirim data"];
      }
      showValidationModal = true;
    } finally {
      loading = false;
    }
  }

  function askDelete(ticket: TicketDisplay) {
    ticketToDelete = ticket;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  async function onConfirmDelete() {
    if (!ticketToDelete) return;

    const res = await fetch(`/api/tickets/${ticketToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      tickets = tickets.filter((t) => t.id !== ticketToDelete?.id);
      notify(
        "success",
        "Berhasil",
        `Ticket ${ticketToDelete.fullNumber} dihapus ✅`
      );
    } else {
      notify("error", "Gagal", "Ticket gagal dihapus ❌");
    }
    ticketToDelete = null;
  }

  // ---------- Reactive ----------
  $: filteredTickets = tickets.filter(
    (t) =>
      (t.fullNumber ?? "").toLowerCase().includes(searchKeyword) ||
      (t.queueName ?? "").toLowerCase().includes(searchKeyword) ||
      (t.servedByName ?? "").toLowerCase().includes(searchKeyword)
  );

  $: sortedTickets = [...filteredTickets].sort((a, b) => {
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  $: paginatedTickets = paginate(sortedTickets, currentPage, pageSize);
</script>

<DefaultLayout title="Tickets">
  <PageHeader
    title="Tickets"
    icon="🎫"
    showAddButton={isAdmin}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <TicketTable
    tickets={paginatedTickets}
    onEdit={(t) => isAdmin && openEditModal(t)}
    onDelete={(t) => isAdmin && askDelete(t)}
    {sortKey}
    {sortDirection}
    onSort={toggleSort}
    {isAdmin}
  />

  <Pagination
    totalItems={filteredTickets.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <TicketFormModal
    show={showTicketModal}
    {isEditMode}
    {loading}
    initial={ticketForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
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
