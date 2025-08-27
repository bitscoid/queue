<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import TokenTable from "$lib/components/token/TokenTable.svelte";
  import TableToolbar from "$lib/components/table/TableToolbar.svelte";
  import TokenFormModal from "$lib/components/token/TokenFormModal.svelte";
  import PageHeader from "$lib/components/table/PageHeader.svelte";
  import Pagination from "$lib/components/table/Pagination.svelte";
  import ConfirmModal from "$lib/components/modal/ConfirmModal.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte"; // 🔔 pakai modal notifikasi
  import type { ApiToken } from "$lib/types";

  export let data: { keys: ApiToken[] };

  let keys: ApiToken[] = Array.isArray(data?.keys) ? data.keys : [];

  let keyToDelete: ApiToken | null = null;
  const confirmModalId = "delete-key-confirm";

  let selectedToken: ApiToken | null = null;
  let showTokenModal = false;
  let isEditMode = false;
  let loading = false;

  // 🔔 State notifikasi
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

  let keyForm = { name: "", token: "" };

  function openAddModal() {
    isEditMode = false;
    selectedToken = null;
    keyForm = { name: "", token: "" };
    showTokenModal = true;
  }

  function openEditModal(key: ApiToken) {
    isEditMode = true;
    selectedToken = key;
    keyForm = { name: key.name, token: key.token };
    showTokenModal = true;
  }

  function onClose() {
    showTokenModal = false;
  }

  async function onSubmit(payload: { name: string; token: string }) {
    loading = true;
    const isEdit = isEditMode && selectedToken;

    try {
      const res = await fetch(
        isEdit ? `/api/token/${selectedToken!.id}` : "/api/token",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let result: any;
      try {
        result = await res.json();
      } catch {
        result = {};
      }

      if (res.ok) {
        if (isEdit) {
          keys = keys.map((k) =>
            k.id === selectedToken!.id ? { ...k, ...result } : k
          );
          notify("success", "Berhasil", "Token berhasil diperbarui ✅");
        } else {
          keys = [...keys, result];
          notify("success", "Berhasil", "Token baru berhasil ditambahkan ✅");
        }
        onClose();
      } else {
        notify(
          "error",
          "Gagal",
          result?.message || result?.error || "Gagal menyimpan token"
        );
      }
    } catch {
      notify("error", "Error", "Terjadi kesalahan saat mengirim data");
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!keyToDelete) return;

    const res = await fetch(`/api/token/${keyToDelete.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      keys = keys.filter((k) => k.id !== keyToDelete?.id);
      notify(
        "success",
        "Berhasil",
        `Token "${keyToDelete?.name}" berhasil dihapus ✅`
      );
    } else {
      notify("error", "Gagal", "Token gagal dihapus ❌");
    }

    keyToDelete = null;
  }

  function askDelete(key: ApiToken) {
    keyToDelete = key;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  // Search, Sort, Pagination
  let searchKeyword = "";
  let currentPage = 1;
  const pageSize = 7;
  let sortKey: keyof ApiToken = "name";
  let sortDirection: "asc" | "desc" = "asc";

  $: filteredTokens = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchKeyword) ||
      k.token.toLowerCase().includes(searchKeyword) ||
      k.creator?.name?.toLowerCase()?.includes(searchKeyword) ||
      k.creator?.email?.toLowerCase()?.includes(searchKeyword)
  );

  $: sortedTokens = [...filteredTokens].sort((a, b) => {
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];

    if (sortKey === "creator") {
      aVal = a.creator?.name || "";
      bVal = b.creator?.name || "";
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  $: paginatedTokens = paginate(sortedTokens, currentPage, pageSize);
  $: if (searchKeyword || sortKey || sortDirection) currentPage = 1;

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function toggleSort(key: keyof ApiToken) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  function paginate(array: ApiToken[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }
</script>

<DefaultLayout title="API Keys">
  <PageHeader
    title="API Keys"
    icon="🔑"
    showAddButton
    addLabel="Generate"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <TokenTable
    tokens={paginatedTokens}
    onEdit={openEditModal}
    onDelete={askDelete}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
  />

  <Pagination
    totalItems={filteredTokens.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <TokenFormModal
    show={showTokenModal}
    {isEditMode}
    {loading}
    initial={keyForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={onClose}
  />

  <ConfirmModal
    id={confirmModalId}
    title="Hapus Token"
    message={`Yakin ingin menghapus ${keyToDelete?.name}?`}
    confirmText="Hapus"
    confirmClass="btn-outline btn-error"
    cancelText="Batal"
    cancelClass="btn-outline btn-warning"
    onConfirm={onConfirmDelete}
  />

  <!-- 🔔 Notification Modal -->
  <NotificationModal
    bind:show={showNotification}
    title={notifTitle}
    message={notifMessage}
    type={notifType}
    onClose={() => (showNotification = false)}
  />
</DefaultLayout>
