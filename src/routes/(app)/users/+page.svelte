<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import UserTable from "$lib/components/user/UserTable.svelte";
  import TableToolbar from "$lib/components/table/TableToolbar.svelte";
  import UserFormModal from "$lib/components/user/UserFormModal.svelte";
  import PageHeader from "$lib/components/table/PageHeader.svelte";
  import Pagination from "$lib/components/table/Pagination.svelte";
  import ConfirmModal from "$lib/components/modal/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/modal/ValidationModal.svelte";
  import NotificationModal from "$lib/components/modal/NotificationModal.svelte"; // tambahkan

  import { userSchema, userUpdateSchema } from "$lib/validations/user";
  import { z } from "zod";
  import { tick, onMount } from "svelte";
  import type { User } from "$lib/types";

  export let data: {
    users: User[];
    isAdmin: boolean;
    currentUserId: number;
  };

  const { users: initialUsers, isAdmin, currentUserId } = data;

  let users = [...initialUsers];
  let queues: { id: number; code: string; name: string }[] = [];
  let userToDelete: User | null = null;
  let selectedUser: User | null = null;
  let showUserModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-user-confirm";
  let searchKeyword = "";
  let sortKey: keyof User = "name";
  let sortDirection: "asc" | "desc" = "asc";

  let userForm = {
    code: "",
    name: "",
    email: "",
    password: "",
    photo: "/uploads/placeholder.png",
    role: "user",
    queueId: null as number | null,
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  // --- Notification state ---
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";

  function showNotif(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
  }

  function closeNotification() {
    showNotification = false;
    notificationMessage = "";
  }

  // Fetch queues
  onMount(async () => {
    try {
      const res = await fetch("/api/queues");
      if (res.ok) {
        queues = await res.json();
      } else {
        console.error("Gagal fetch queues");
      }
    } catch (err) {
      console.error(err);
    }
  });

  // helper
  function normalizeUser(raw: any): User {
    return {
      ...raw,
      role: (raw.role ?? "user") as "admin" | "user",
      photo: raw.photo ?? "/uploads/placeholder.png",
      createdAt: raw.createdAt
        ? new Date(raw.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: raw.updatedAt
        ? new Date(raw.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  }

  function openAddModal() {
    isEditMode = false;
    selectedUser = null;
    userForm = {
      code: "",
      name: "",
      email: "",
      password: "",
      photo: "/uploads/placeholder.png",
      role: "user",
      queueId: null,
    };
    showUserModal = true;
  }

  function closeFormModal() {
    showUserModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof userForm) {
    loading = true;
    validationMessages = [];

    try {
      const schema = isEditMode ? userUpdateSchema : userSchema;
      const validated = schema.parse(payload);

      const endpoint =
        isEditMode && selectedUser
          ? `/api/users/${selectedUser.id}`
          : "/api/users";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        const normalized = normalizeUser(result);
        if (isEditMode && selectedUser) {
          users = users.map((u) =>
            u.id === selectedUser!.id ? { ...u, ...normalized } : u
          );
          showNotif("User berhasil diperbarui", "success");
        } else {
          users = [...users, normalized];
          showNotif("User berhasil ditambahkan", "success");
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

  async function onConfirmDelete() {
    if (!userToDelete) return;
    const res = await fetch(`/api/users/${userToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      users = users.filter((u) => u.id !== userToDelete?.id);
      showNotif("User berhasil dihapus", "success");
    } else {
      showNotif("Gagal menghapus user", "error");
    }
    userToDelete = null;
  }

  function askDelete(user: User) {
    userToDelete = user;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: User[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof User | "queue") {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortKey === "queue") {
      aVal = a.queue?.name ?? "";
      bVal = b.queue?.name ?? "";
    } else {
      aVal = a[sortKey] ?? "";
      bVal = b[sortKey] ?? "";
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  $: paginatedUsers = paginate(sortedUsers, currentPage, pageSize);

  function openEditModal(user: User) {
    isEditMode = true;
    selectedUser = user;
    userForm = {
      code: user.code ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      photo: user.photo ?? "/uploads/placeholder.png",
      role: user.role ?? "user",
      queueId: user.queueId ?? null,
    };
    showUserModal = true;
  }

  $: filteredUsers = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(searchKeyword) ||
      (u.email ?? "").toLowerCase().includes(searchKeyword)
  );
</script>

<DefaultLayout title="Users">
  <PageHeader
    title="Users"
    icon="👤"
    showAddButton={isAdmin}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <UserTable
    users={paginatedUsers}
    onEdit={(user) => {
      if (isAdmin || user.id === currentUserId) openEditModal(user);
    }}
    onDelete={(user) => isAdmin && askDelete(user)}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
    {currentUserId}
  />

  <Pagination
    totalItems={filteredUsers.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <UserFormModal
    show={showUserModal}
    {isEditMode}
    {loading}
    initial={userForm}
    {isAdmin}
    {queues}
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
    show={showNotification}
    message={notificationMessage}
    type={notificationType}
    onClose={closeNotification}
  />

  {#if isAdmin}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus User"
      message={`Yakin ingin menghapus ${userToDelete?.name}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>
