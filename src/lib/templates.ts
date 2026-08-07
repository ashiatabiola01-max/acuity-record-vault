import {
  INTAKE_EMAIL,
  PACKAGES,
  REGISTRAR_EMAIL,
  ROLE_LABELS,
  type VaultRequest,
} from "./vault";

export type Template = { id: string; name: string; channel: "Email" | "USPS"; body: string };

function addressBlock(r: VaultRequest) {
  return [r.fullName, r.department, r.address1, r.address2, [r.city, r.state, r.postalCode].filter(Boolean).join(", "), r.country]
    .filter(Boolean)
    .join("\n");
}

export function buildTemplates(r: VaultRequest): Template[] {
  const pkg = PACKAGES[r.pkg];
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return [
    {
      id: "ack",
      name: "Receipt Acknowledgement",
      channel: "Email",
      body: `From: ${INTAKE_EMAIL}
To: ${r.email}
Subject: [${r.id}] Request Received — Acuity Repository Vault

Dear ${r.fullName},

We confirm receipt of your record request submitted to the Acuity Repository Vault on behalf of ${r.subjectName}.

  Registry / Tracking ID : ${r.id}
  Requestor Profile      : ${ROLE_LABELS[r.role]}
  Service Requested      : ${pkg.label} ($${pkg.price}.00)
  Dissemination Method   : ${r.delivery === "usps" ? "USPS Registered Mail" : "Digital Transfer (Secure Email)"}

Your request is queued for review by the Office of the Registrar. Standard fulfillment is 3–5 business days from verification of payment and release authorization. You may monitor status at any time using your Registry ID in the Track Request portal.

Respectfully,
Document Intake Team
Acuity RISE Education Group
${INTAKE_EMAIL}`,
    },
    {
      id: "release",
      name: "Release / FERPA Follow-Up",
      channel: "Email",
      body: `From: ${REGISTRAR_EMAIL}
To: ${r.email}
Subject: [${r.id}] Action Required — Signed Release Authorization

Dear ${r.fullName}${r.department ? ` (${r.department})` : ""},

Before the Office of the Registrar can release records for ${r.subjectName}, we require a completed and signed FERPA/HIPAA release authorization from the record holder.

  Registry / Tracking ID : ${r.id}
  Verification ID        : ${r.verificationId || "— not provided —"}
  Release on File        : ${r.releaseFormName || "None received"}

Please reply to this message with the signed authorization attached in PDF format. Requests without valid authorization are held for 30 days and then closed.

Sincerely,
Office of Compliance & Registrar Services
Acuity RISE Education Group
${REGISTRAR_EMAIL}`,
    },
    {
      id: "digital",
      name: "Digital Fulfillment Notice",
      channel: "Email",
      body: `From: ${REGISTRAR_EMAIL}
To: ${r.recipientEmail || r.email}
Subject: [${r.id}] Official Academic Records — Secure Transfer

Dear ${r.fullName},

Attached please find the official records requested under Registry ID ${r.id}:

  Record Subject : ${r.subjectName}
  Documents      : ${pkg.label}
  Issued On      : ${today}

This transmission is certified by the Office of the Registrar of Acuity RISE Education Group. The attached documents are considered official only while in their original, unaltered digital form. Redistribution without the written consent of the record holder is prohibited under FERPA.

Questions regarding authenticity may be directed to ${REGISTRAR_EMAIL}.

Sincerely,
Office of Compliance & Registrar Services
Acuity RISE Education Group`,
    },
    {
      id: "usps",
      name: "USPS Registered Mail Cover Letter",
      channel: "USPS",
      body: `ACUITY RISE EDUCATION GROUP
Office of Compliance & Registrar Services
acuityriseeducation.solutions

${today}

SENT VIA USPS REGISTERED MAIL — RETURN RECEIPT REQUESTED

${addressBlock(r)}

RE: Official Academic Records — Registry ID ${r.id}

Dear ${r.fullName},

Enclosed are the official academic records requested for ${r.subjectName} under Registry ID ${r.id}.

  Documents Enclosed : ${pkg.label}
  Requestor Profile  : ${ROLE_LABELS[r.role]}
  Fee Remitted       : $${pkg.price}.00
  Verification ID    : ${r.verificationId || "N/A"}

Documents are sealed and bear the signature of the Registrar. A sealed envelope that has been opened or tampered with voids the official status of its contents.

Correspondence regarding this transmission should reference the Registry ID above and be directed to ${REGISTRAR_EMAIL}.

Respectfully,

_____________________________
Office of the Registrar
Acuity RISE Education Group`,
    },
  ];
}
