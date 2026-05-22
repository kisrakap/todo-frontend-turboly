<template>
  <div class="p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold text-green-600">Home 🎉</h1>
    <p class="mt-2">buat to do list kamu</p>
  </div>

  <div class="flex justify-center w-full p-4">
    <form
      @submit.prevent="authStore.addTask"
      class="grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-5xl bg-white p-6 rounded-lg shadow-sm"
    >
      <div class="md:col-span-5">
        <label class="block text-sm font-medium mb-1 text-slate-700"
          >Title</label
        >
        <input
          v-model="authStore.form.title"
          type="text"
          placeholder="Misal: Implement Header Component..."
          class="w-full border p-2 rounded focus:outline-blue-500 text-slate-800"
          required
        />
      </div>

      <div class="md:col-span-5">
        <label class="block text-sm font-medium mb-1 text-slate-700"
          >Description</label
        >
        <input
          v-model="authStore.form.description"
          type="text"
          placeholder="Misal: Slicing navbar minimalis..."
          class="w-full border p-2 rounded focus:outline-blue-500 text-slate-800"
          required
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1 text-slate-700"
          >Due Date</label
        >
        <input
          v-model="authStore.form.dueDate"
          type="date"
          class="w-full border p-2 rounded focus:outline-blue-500 text-slate-800"
          required
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1 text-slate-700"
          >Priority</label
        >
        <select
          v-model="authStore.form.priority"
          class="w-full border p-2 rounded focus:outline-blue-500 text-slate-800"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div class="md:col-span-1 flex items-end">
        <button
          type="submit"
          :disabled="authStore.taskLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-medium transition shadow disabled:opacity-50 h-[42px]"
        >
          {{ authStore.taskLoading ? "..." : "+ Tambah Task" }}
        </button>
      </div>
    </form>
  </div>

  <div
    v-if="authStore.taskError"
    class="mt-4 p-4 bg-red-100 text-red-700 rounded"
  >
    {{ authStore.taskError }}
  </div>

  <div v-if="authStore.taskLoading" class="mt-6 text-center text-slate-600">
    Memuat tugas...
  </div>

  <div
    v-else-if="authStore.tasks.length === 0"
    class="mt-6 text-center text-slate-600"
  >
    Tidak ada tugas. Buat tugas baru untuk memulai!
  </div>

  <div v-else class="mt-6 space-y-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-slate-800">Your List</h3>
      <div class="flex gap-2">
        <button
          @click="authStore.sortBy = 'dueDate'"
          :class="[
            'px-4 py-2 rounded font-medium transition',
            authStore.sortBy === 'dueDate'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
          ]"
        >
          📅 By Date
        </button>
        <button
          @click="authStore.sortBy = 'priority'"
          :class="[
            'px-4 py-2 rounded font-medium transition',
            authStore.sortBy === 'priority'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
          ]"
        >
          ⚡ By Priority
        </button>
        <button
          @click="authStore.toggleIncompleteFilter()"
          :class="[
            'px-4 py-2 rounded font-medium transition',
            authStore.showIncompleteOnly
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
          ]"
        >
          ✅ Only Complete
        </button>
        <button
          @click="authStore.toggleCompletedFilter()"
          :class="[
            'px-4 py-2 rounded font-medium transition',
            authStore.showCompletedOnly
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
          ]"
        >
          ✔️ Only Completed
        </button>
      </div>
    </div>
    <div
      v-for="task in authStore.sortedTasks"
      :key="task.id"
      class="p-4 border border-slate-200 rounded bg-slate-50"
    >
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1">
          <p
            :class="[
              'font-bold text-slate-900',
              task.isComplete ? 'line-through text-slate-400 opacity-60' : '',
            ]"
          >
            {{ task.title }}
          </p>
          <p
            :class="[
              'font-medium text-slate-800',
              task.isComplete ? 'opacity-60' : '',
            ]"
          >
            {{ task.description }}
          </p>
          <p
            :class="[
              'text-sm text-slate-600',
              task.isComplete ? 'opacity-60' : '',
            ]"
          >
            Due: {{ new Date(task.dueDate).toLocaleDateString("id-ID") }}
          </p>
          <span
            :class="[
              'text-xs px-2 py-1 rounded mt-2 inline-block',
              task.priority?.toLowerCase() === 'high'
                ? 'bg-red-200 text-red-700'
                : task.priority?.toLowerCase() === 'medium'
                  ? 'bg-yellow-200 text-yellow-700'
                  : 'bg-green-200 text-green-700',
            ]"
          >
            {{ task.priority }}
          </span>
        </div>

        <div class="flex flex-col gap-2 justify-between">
          <button
            type="button"
            @click="authStore.completeTask(task.id)"
            class="px-4 py-2 rounded font-medium transition bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {{ task.isComplete ? "Mark Incomplete" : "Mark Complete" }}
          </button>
          <button
            type="button"
            @click="authStore.deleteTask(task.id)"
            class="px-4 py-2 rounded font-medium transition bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

// Restore auth state from localStorage on page load
const restoreAuthState = () => {
  if (typeof window !== "undefined") {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      authStore.token = savedToken;
      authStore.user = JSON.parse(savedUser);
    } else {
      router.push("/login");
    }
  }
};

definePageMeta({
  middleware: [
    function () {
      const auth = useAuthStore();
      // Check both stored token and in-memory token
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!auth.isAuthenticated && !storedToken) {
        return navigateTo("/login");
      }
    },
  ],
});

onMounted(() => {
  restoreAuthState();
  if (authStore.isAuthenticated) {
    authStore.fetchTasks();
  }
});
</script>
