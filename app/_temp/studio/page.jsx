import { redirect } from "next/navigation";

export default function StudioIndexRedirect() {
  // Redirect /studio -> /studio/simulation
  redirect("/studio/simulation");
}
