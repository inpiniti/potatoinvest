import { redirect } from "next/navigation";

export default function StudioIndexPage() {
  // Redirect /studio -> /studio/simulation
  redirect("/studio/simulation");
}
