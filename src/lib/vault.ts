export type RequestorRole = "student" | "employer" | "institution";
export type DocPackage = "transcript" | "verification" | "both";
export type Delivery = "digital" | "usps";
export type RequestStatus = "Submitted" | "Processing" | "Fulfilled";

export const ROLE_LABELS: Record<RequestorRole, string> = {
  student: "Student",
  employer: "Employer / Verification Agency",
  institution: "Academic Institution",
};

export const PACKAGES: Record<
  DocPackage,
  { label: string; price: number; paypal: string; blurb: string }
> = {
  transcript: {
    label: "Transcript Only",
    price: 35,
    paypal: "https://www.paypal.com/ncp/payment/QP3UJ7ARQDCW6",
    blurb: "Official sealed academic transcript for the enrolled term(s) of record.",
  },
  verification: {
    label: "Academic Verification Only",
    price: 25,
    paypal: "https://www.paypal.com/ncp/payment/FAAVQD426LC9W",
    blurb: "Signed enrollment / completion verification letter from the Registrar.",
  },
  both: {
    label: "Transcript & Academic Verification",
    price: 50,
    paypal: "https://www.paypal.com/ncp/payment/Y4WKUGFUDZUW6",
    blurb: "Complete record package — transcript plus verification letter.",
  },
};

export const REGISTRAR_EMAIL = "compliance@acuityriseeducation.solutions";
export const INTAKE_EMAIL = "vault@acuityriseeducation.solutions";

export type VaultRequest = {
  id: string;
  createdAt: string;
  status: RequestStatus;
  role: RequestorRole;
  fullName: string;
  department: string;
  email: string;
  phone: string;
  // student-specific
  formerName?: string;
  nameChangeDoc?: boolean;
  studentTrack?: string;
  studentId?: string;
  // employer / institution
  verificationId?: string;
  releaseFormName?: string;
  // subject of record
  subjectName: string;
  subjectDob?: string;
  // package
  pkg: DocPackage;
  amount: number;
  paymentRef?: string;
  // delivery
  delivery: Delivery;
  recipientEmail?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
};

const KEY = "arv.requests.v1";

export function loadRequests(): VaultRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VaultRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveRequests(list: VaultRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function newTrackingId(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `ARV-${year}-${n}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
