// listingViewCountUpdate.ts
const API_BASE_URL = "http://localhost:3000";

export default async function updateViewCount(listingId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/listing/incViews/${listingId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update view count");
  }

  return response.json();
}
