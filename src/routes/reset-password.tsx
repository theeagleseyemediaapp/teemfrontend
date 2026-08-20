import { createFileRoute, Link } from "@tanstack/react-router";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — The Eagle's Eye Media" },
      { name: "description", content: "Reset your account password." },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  return <ResetPasswordForm />;
}
