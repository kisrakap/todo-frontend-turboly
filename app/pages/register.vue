<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center text-slate-800">Daftar Akun Baru</h2>
    
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Username</label>
        <input v-model="username" type="text" class="w-full border p-2 rounded focus:outline-blue-500" required />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Password</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded focus:outline-blue-500" required />
      </div>

      <p v-if="authStore.error" class="text-red-500 text-sm">{{ authStore.error }}</p>
      
      <button :disabled="authStore.loading" type="submit" class="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition">
        {{ authStore.loading ? 'Mendaftarkan...' : 'Register' }}
      </button>
    </form>
    
    <p class="text-sm text-center mt-4 text-slate-600">
      Sudah punya akun? <NuxtLink to="/login" class="text-blue-600 hover:underline">Login di sini</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const username = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  try {
    await authStore.register(username.value, password.value)
    alert('Registrasi sukses! Silakan login.')
    router.push('/login')
  } catch (err) {
    console.error(err)
  }
}
</script>
