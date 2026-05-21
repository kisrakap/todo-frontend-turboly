import { defineStore } from "pinia";

const initializeAuthState = () => {
  if (typeof window === "undefined") {
    return { user: {}, token: null };
  }

  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  return {
    user: savedUser ? JSON.parse(savedUser) : {},
    token: savedToken || null,
  };
};

export const useAuthStore = defineStore("auth", {
  state: () => {
    const auth = initializeAuthState();
    return {
      // Auth state
      user: auth.user,
      token: auth.token,
      loading: false,
      error: null,

      // Task state
      tasks: [],
      taskLoading: false,
      taskError: null,
      sortBy: "dueDate", // "dueDate" atau "priority"
      showIncompleteOnly: false,
      showCompletedOnly: false,
      form: {
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
      },
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,

    sortedTasks: (state) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };

      const getPriorityValue = (task) => {
        const key = String(task.priority || "medium").toLowerCase();
        return priorityOrder[key] || priorityOrder.medium;
      };

      const getDueDateValue = (task) => {
        return task.dueDate ? new Date(task.dueDate).getTime() : Infinity;
      };

      const completeOrder = (task) => (task.isComplete ? 1 : 0);

      return [...state.tasks]
        .filter((task) => {
          if (state.showIncompleteOnly && task.isComplete) return false;
          if (state.showCompletedOnly && !task.isComplete) return false;
          return true;
        })
        .sort((a, b) => {
          const completeDiff = completeOrder(a) - completeOrder(b);
          if (completeDiff !== 0) return completeDiff;

          const priorityDiff = getPriorityValue(a) - getPriorityValue(b);
          if (priorityDiff !== 0) return priorityDiff;

          return getDueDateValue(a) - getDueDateValue(b);
        });
    },
  },

  actions: {
    async login(username, password, email) {
      this.loading = true;
      this.error = null;

      try {
        const response = await useAPI("/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password, email }),
        });

        console.log(response, "login response"); // Debug log

        // Construct user object dari response
        this.user = {
          userId: response.userId,
          username: username,
          email: email,
        };
        this.token = response.token;

        // Simpan ke localStorage
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("token", this.token);

        await this.fetchTasks();
      } catch (err) {
        this.error = err.message || "Login failed";
      } finally {
        this.loading = false;
      }
    },

    async register(username, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await useAPI("/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });

        // Construct user object dari response
        this.user = {
          userId: response.userId,
          username: username,
        };
        this.token = response.token;

        // Simpan ke localStorage
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("token", this.token);
      } catch (err) {
        this.error = err.message || "Registration failed";
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.tasks = [];
      this.form = {
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
      };
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
    },

    // Task actions
    async fetchTasks() {
      this.taskLoading = true;
      this.taskError = null;
      const userId = localStorage.getItem("userId");

      if (!userId) {
        this.taskError = "gagal fetch data task";
        this.taskLoading = false;
        return;
      }

      try {
        const response = await useAPI(`/tasks?userId=${userId}`);
        console.log(response, "fetch tasks response"); // Debug log

        // Handle different response structures
        if (Array.isArray(response)) {
          this.tasks = response;
        } else if (response.tasks && Array.isArray(response.tasks)) {
          this.tasks = response.tasks;
        } else if (response.data && Array.isArray(response.data)) {
          this.tasks = response.data;
        } else {
          this.tasks = [];
        }

        console.log(this.tasks, "tasks after fetch"); // Debug log
      } catch (err) {
        this.taskError = err.message || "Gagal memuat tugas";
        console.error(err, "fetch tasks error"); // Debug log
      } finally {
        this.taskLoading = false;
      }
    },

    async addTask() {
      if (!this.form.title || !this.form.description || !this.form.dueDate) {
        this.taskError = "Title, Deskripsi, dan Due Date harus diisi";
        return;
      }

      this.taskLoading = true;
      this.taskError = null;

      try {
        await useAPI("/tasks", {
          method: "POST",
          body: JSON.stringify({
            ...this.form,
            userId: localStorage.getItem("userId"),
          }),
        });
        this.form = {
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
        };
        await this.fetchTasks();
      } catch (err) {
        this.taskError = err.message || "Gagal menambah tugas";
      } finally {
        this.taskLoading = false;
      }
    },

    completeTask(taskId) {
      return useAPI(`/tasks/${taskId}/toggle`, {
        method: "PATCH",
      })
        .then(() => this.fetchTasks())
        .catch((err) => {
          this.taskError = err.message || "Gagal memperbarui status tugas";
        });
    },

    edittask(taskId, updatedData) {
      return useAPI(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      })
        .then(() => this.fetchTasks())
        .catch((err) => {
          this.taskError = err.message || "Gagal memperbarui tugas";
        });
    },

    deleteTask(taskId) {
      return useAPI(`/tasks/${taskId}`, {
        method: "DELETE",
      })
        .then(() => this.fetchTasks())
        .catch((err) => {
          this.taskError = err.message || "Gagal menghapus tugas";
        });
    },

    toggleIncompleteFilter() {
      this.showIncompleteOnly = !this.showIncompleteOnly;
      if (this.showIncompleteOnly) {
        this.showCompletedOnly = false;
      }
    },

    toggleCompletedFilter() {
      this.showCompletedOnly = !this.showCompletedOnly;
      if (this.showCompletedOnly) {
        this.showIncompleteOnly = false;
      }
    },

    resetTaskError() {
      this.taskError = null;
    },
  },
});
