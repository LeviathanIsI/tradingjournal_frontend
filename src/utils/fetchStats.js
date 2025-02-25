export const fetchStats = async (type) => {
  if (!type) {
    console.error("❌ fetchStats() missing required 'type' argument");
    return null;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No authentication token found!");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/${type}/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch ${type} stats`);
    }

    return (await response.json()).data;
  } catch (err) {
    console.error(`❌ Error fetching ${type} stats:`, err);
    return null;
  }
};
