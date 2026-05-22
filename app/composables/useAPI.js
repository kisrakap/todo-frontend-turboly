export const useAPI = (url, options = {}) => {
  const config = useRuntimeConfig();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return $fetch(url, {
    baseURL: "https://todobackend-turboly.vercel.app/api",
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};
