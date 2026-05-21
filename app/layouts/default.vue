<template>
  <div>
    <nav
      class="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center"
    >
      <h1 class="text-xl font-bold tracking-wide">Todo App </h1>

      <div class="flex gap-4 items-center">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm bg-slate-700 px-3 py-1 rounded"
            >Halo, {{ authStore.user?.username }}</span
          >
          <button
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hover:underline text-sm">Login</NuxtLink>
          <NuxtLink
            to="/register"
            class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
            >Register</NuxtLink
          >
        </template>
      </div>
    </nav>
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
