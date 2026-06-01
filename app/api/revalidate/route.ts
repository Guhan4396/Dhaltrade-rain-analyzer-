import { revalidatePath, revalidateTag } from "next/cache"

export async function POST() {
  revalidatePath("/")
  revalidateTag("weather")
  revalidateTag("summary")
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
