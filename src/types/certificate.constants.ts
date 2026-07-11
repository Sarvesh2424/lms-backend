export const CERTIFICATE_BACKGROUND_STYLES = ["aurora", "amber", "emerald", "slate"] as const;
export type CertificateBackgroundStyle = (typeof CERTIFICATE_BACKGROUND_STYLES)[number];