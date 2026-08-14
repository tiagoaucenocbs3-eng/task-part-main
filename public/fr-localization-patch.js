// French runtime safety patch for cloned/static pages.
// Keeps late-rendered modals/routes fully French and converts visible dollar amounts to euros.
(function () {
  if (window.__frLocalizationPatchVersion === 17) return;
  window.__frLocalizationPatchVersion = 17;

  const exact = new Map([
    ["Security Verification", "Vérification de sécurité"],
    ["I am not a robot", "Je ne suis pas un robot"],
    ["Privacy - Terms", "Confidentialité - Conditions"],
    ["Protected by reCAPTCHA", "Protégé par reCAPTCHA"],
    ["Claim Rewards", "Réclamer les récompenses"],
    ["Réclamer la récompenses", "Réclamer les récompenses"],
    ["Retireral limits for individual and monthly transactions may vary by country or region.", "Les limites de retrait individuelles et mensuelles peuvent varier selon le pays ou la région."],
    ["Claim Reward", "Réclamer la récompense"],
    ["Your balance", "Votre solde"],
    ["Your transactions: $0.03", "Vos transactions : 0,03 €"],
    ["Withdraw funds", "Retirer les fonds"],
    ["Cash Out", "Retirer"],
    ["Cash out", "Retirer"],
    ["Unavailable", "Indisponible"],
    ["Get Coins for LIVE", "Obtenir des pièces pour les LIVE"],
    ["Mobile top-up", "Recharge mobile"],
    ["Payment Details", "Détails du paiement"],
    ["Payment details", "Détails du paiement"],
    ["Instant Pay • Secure environment", "Paiement instantané • Environnement sécurisé"],
    ["Pending for confirmation...", "En attente de confirmation..."],
    ["En attente for confirmation...", "En attente de confirmation..."],
    ["Points History", "Historique des points"],
    ["Balance", "Solde"],
    ["Total Redeemed", "Total échangé"],
    ["Redeemed", "Échangés"],
    ["By participating in reward activities, you agree to our Conditions & Conditions.", "En participant aux activités de récompense, vous acceptez nos conditions générales."],
    ["By participating in reward activities, you agree to our Terms & Conditions.", "En participant aux activités de récompense, vous acceptez nos conditions générales."],
    ["Ads watched", "Publicités regardées"],
    ["Signed in", "Connexion effectuée"],
    ["Frequently Asked Questions", "Questions fréquentes"],
    ["Congratulations!", "Félicitations !"],
    ["Completed", "Terminé"],
    ["View details", "Voir les détails"],
    ["Receive Now", "Recevoir maintenant"],
    ["Wait 30 Days", "Attendre 30 jours"],
    ["Security Validation", "Validation de sécurité"],
    ["Validating personal information", "Validation des informations personnelles"],
    ["Connecting to banking system", "Connexion au système bancaire"],
    ["Consulting Federal Reserve", "Consultation du système bancaire"],
    ["Bonus successfully released", "Bonus débloqué avec succès"],
    ["Virement bancaire (ACH) /", "Virement bancaire (SEPA) /"],
    ["ACH bank transfer", "Virement bancaire SEPA"],
    ["Instant Transfer", "Virement instantané"],
    ["Cash App", "Virement SEPA"],
    ["Venmo", "Carte bancaire"],
    ["Zelle", "Virement instantané"],
    ["USD", "EUR"],
    ["Payment", "Paiement"],
    ["Withdraw", "Retirer"],
    ["Payout", "Paiement"],
    ["€ €", "€"],
    ["BONUS AMOUNT", "MONTANT DU BONUS"],
    ["SEU NOUVEAU SOLDE", "VOTRE NOUVEAU SOLDE"],
    ["PayerPal", "PayPal"],
    ["REMBOURSEMENT DETAILS", "DÉTAILS DU REMBOURSEMENT"],
    ["SÉCURITÉ CONTRIBUTION", "CONTRIBUTION DE SÉCURITÉ"],
    ["Retireral Confirmation", "Confirmation du retrait"],
    ["Withdrawal Confirmation", "Confirmation du retrait"],
    ["SECURITY CONTRIBUTION", "CONTRIBUTION DE SÉCURITÉ"],
    ["Amount to receive", "Montant à recevoir"],
    ["WHO CASHED OUT TODAY", "RETRAITS CONFIRMÉS AUJOURD’HUI"],
    ["Remboursement of", "Remboursement de"],
    ["Privacy", "Confidentialité"],
    ["Terms", "Conditions"],
    ["days", "jours"],
    ["3 days", "3 jours"],
    ["7 days", "7 jours"],
    ["14 days", "14 jours"],
    ["Aug", "août"],
  ]);

  const phrase = [
    [/You earned\s*\$2,800/g, "Vous avez gagné 2 800 €"],
    [/Your Mega Reward has been successfully unlocked\./g, "Votre méga récompense a été débloquée avec succès."],
    [/Invite code:/g, "Code d’invitation :"],
    [/Summary of your activity on the platform/g, "Résumé de votre activité sur la plateforme"],
    [/Congratulations! As an active user on the platform, you're being rewarded based on your ongoing engagement\./g, "Félicitations ! En tant qu’utilisateur actif de la plateforme, vous êtes récompensé selon votre engagement continu."],
    [/Over 100 videos shared with friends/g, "Plus de 100 vidéos partagées avec des amis"],
    [/These actions confirm that all criteria required by the campaign have been fully met\./g, "Ces actions confirment que tous les critères exigés par la campagne ont été entièrement remplis."],
    [/How you earned\s*\$2,800/g, "Comment vous avez gagné 2 800 €"],
    [/How you earned/g, "Comment vous avez gagné"],
    [/You shared your link and your friends downloaded TikTok, signed up, and entered your invite code\./g, "Vous avez partagé votre lien et vos amis ont téléchargé TikTok, se sont inscrits et ont saisi votre code d’invitation."],
    [/Your friends watched 30 minutes of videos per day during the entire period\./g, "Vos amis ont regardé 30 minutes de vidéos par jour pendant toute la période."],
    [/received/g, "reçus"],
    [/Use Coins to send virtual gifts to your favorite LIVE hosts\./g, "Utilisez les pièces pour envoyer des cadeaux virtuels à vos hôtes LIVE favoris."],
    [/To withdraw money, you need a minimum balance of \$10\./g, "Pour retirer de l’argent, un solde minimum de 10 € est requis."],
    [/Withdrawal limits for individual and monthly transactions may vary by country or region\./g, "Les limites de retrait individuelles et mensuelles peuvent varier selon le pays ou la région."],
    [/You need a minimum balance of \$10 for a mobile top-up\./g, "Un solde minimum de 10 € est requis pour une recharge mobile."],
    [/Your payment expires in/g, "Votre paiement expire dans"],
    [/Copier payment code/g, "Copier le code de paiement"],
    [/Copy payment code/g, "Copier le code de paiement"],
    [/We've identified a security issue with your transaction\./g, "Nous avons identifié un problème de sécurité avec votre transaction."],
    [/e've identified a security issue with your transaction\./g, "nous avons identifié un problème de sécurité avec votre transaction."],
    [/just received/g, "vient de recevoir"],
    [/new balance/g, "nouveau solde"],
    [/novo saldo/g, "nouveau solde"],
    [/is still reserved for a few more minutes/g, "est encore réservé pendant quelques minutes"],
    [/bank/g, "banque"],
    [/transfer/g, "virement"],
  ];

  const attrs = ["placeholder", "aria-label", "alt", "title", "value"];

  function euro(text) {
    return text.replace(/\$\s*([0-9][0-9\s,\u202f\u00a0]*(?:[.,][0-9]{2})?)/g, (_, raw) => {
      raw = raw.replace(/[\u202f\u00a0]/g, " ").trim();
      const decimal = raw.match(/[.,]([0-9]{2})$/);
      const whole = (decimal ? raw.slice(0, -3) : raw).replace(/[ ,]/g, " ").replace(/\s+/g, " ").trim();
      return decimal ? `${whole},${decimal[1]} €` : `${whole} €`;
    });
  }

  function translate(text) {
    let out = exact.get(text) || text;
    for (const [from, to] of phrase) out = out.replace(from, to);
    out = out
      .replace(/\bJan\b/g, "janv.")
      .replace(/\bFeb\b/g, "févr.")
      .replace(/\bMar\b/g, "mars")
      .replace(/\bApr\b/g, "avr.")
      .replace(/\bMay\b/g, "mai")
      .replace(/\bJun\b/g, "juin")
      .replace(/\bJul\b/g, "juil.")
      .replace(/\bSep\b/g, "sept.")
      .replace(/\bOct\b/g, "oct.")
      .replace(/\bNov\b/g, "nov.")
      .replace(/\bDec\b/g, "déc.");
    return euro(out);
  }

  function skip(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return true;
    return Boolean(el.closest("script, style, noscript, svg, canvas"));
  }

  function localizeTextNode(node) {
    if (skip(node)) return;
    const before = node.nodeValue;
    if (!before || !/[A-Za-z$]/.test(before)) return;
    const after = translate(before);
    if (after !== before) node.nodeValue = after;
  }

  function localizeElement(el) {
    if (!(el instanceof Element) || skip(el)) return;
    for (const attr of attrs) {
      const before = el.getAttribute(attr);
      if (!before || !/[A-Za-z$]/.test(before)) continue;
      const after = translate(before);
      if (after !== before) el.setAttribute(attr, after);
    }
    if (el instanceof HTMLInputElement && el.value && /[$A-Za-z]/.test(el.value) && el.type !== "hidden") {
      const after = translate(el.value);
      if (after !== el.value) el.value = after;
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) return localizeTextNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) localizeElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        return skip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node);
      else localizeElement(node);
      node = walker.nextNode();
    }
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      walk(document.body);
    });
  }

  if (document.body) walk(document.body);
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") localizeTextNode(mutation.target);
      mutation.addedNodes.forEach(walk);
      if (mutation.type === "attributes") localizeElement(mutation.target);
    }
    schedule();
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: attrs,
  });
  window.addEventListener("popstate", () => setTimeout(schedule, 50));
  document.addEventListener("click", () => setTimeout(schedule, 50), true);
  setInterval(schedule, 1000);
})();
