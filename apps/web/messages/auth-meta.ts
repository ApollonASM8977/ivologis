import type { Messages } from "@/lib/i18n";

/** Titres et descriptions (onglet, partages) des pages de connexion : mêmes textes que leur en-tête (`AuthLayout`). */
const fr = {
  login: { title: "Connexion", description: "Accédez à votre espace IVOLOGIS" },
  register: { title: "Créer un compte", description: "Propriétaires et locataires suivis par l'agence" },
  forgotPassword: { title: "Mot de passe oublié", description: "Votre agence vous transmet un lien de réinitialisation" },
  resetPassword: { title: "Nouveau mot de passe", description: "Choisissez un nouveau mot de passe" },
};

export const authMeta: Messages<typeof fr> = {
  fr,
  en: {
    login: { title: "Sign in", description: "Access your IVOLOGIS space" },
    register: { title: "Create an account", description: "Owners and tenants managed by the agency" },
    forgotPassword: { title: "Forgot password", description: "Your agency sends you a reset link" },
    resetPassword: { title: "New password", description: "Choose a new password" },
  },
};
