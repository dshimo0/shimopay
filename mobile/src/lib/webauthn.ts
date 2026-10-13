// WebAuthn: confirmacao de acao usando a biometria REAL do dispositivo
// (FaceID, digital, PIN do aparelho) via platform authenticator.
// Isto e verificacao de POSSE/BIOMETRIA LOCAL — nao e KYC nem liveness
// certificado (isso exige FaceTec/similar licenciado: NEEDS_SOURCE).
// Requer contexto seguro (https ou localhost); onde nao suportado, o app
// cai de volta para o PIN demo.

const CREDENTIAL_KEY = "shimo_webauthn_credential";

export interface StoredCredential {
  id: string; // credential.id retornado pelo browser
  label: string;
  registeredAt: string; // ISO
}

function isSecure(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

export function isWebAuthnAvailable(): boolean {
  return (
    isSecure() &&
    typeof window !== "undefined" &&
    "PublicKeyCredential" in window &&
    typeof navigator.credentials?.create === "function" &&
    typeof navigator.credentials?.get === "function"
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getStoredCredential(): StoredCredential | null {
  try {
    const raw = localStorage.getItem(CREDENTIAL_KEY);
    return raw ? (JSON.parse(raw) as StoredCredential) : null;
  } catch {
    return null;
  }
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Registra uma credencial device-bound (uma por navegador/aparelho).
export async function registerDeviceCredential(label: string): Promise<StoredCredential> {
  if (!isWebAuthnAvailable()) throw new Error("WebAuthn indisponivel neste contexto");

  const userId = randomBytes(16);
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: "ShimoPay Demo" },
      user: { id: userId, name: label, displayName: label },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Credencial inesperada");
  }

  const stored: StoredCredential = {
    id: credential.id,
    label,
    registeredAt: new Date().toISOString(),
  };
  localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(stored));
  return stored;
}

export function removeStoredCredential(): void {
  try {
    localStorage.removeItem(CREDENTIAL_KEY);
  } catch {
    // nada persistido para remover.
  }
}

// Pede ao usuario a biometria/PIN do dispositivo. Resolve true quando o
// authenticator valida (assertion criada); false em cancelamento/falha.
export async function verifyWithDeviceBiometry(reason: string): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60_000,
      },
    });
    // A verificacao real da assinatura contra chave publica registrada exige
    // servidor; aqui a presenca da assertion com UV required ja prova que o
    // dono desbloqueou o dispositivo nesta interacao.
    return assertion instanceof PublicKeyCredential;
  } catch (error) {
    console.info(`Biometria do dispositivo nao concluida (${reason}):`, error);
    return false;
  }
}
