import { put } from "@vercel/blob"

// Function to upload an image to Blob storage
export async function uploadImage(file: File, filename: string) {
  try {
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
