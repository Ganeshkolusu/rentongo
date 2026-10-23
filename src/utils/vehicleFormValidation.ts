// utils/vehicleFormValidation.ts
// Shared rules for the vehicle create/edit forms (car + bike).
import type { PickupAddress } from "../components/PickupLocationPicker";

export const MSG = {
  pickupLocation: "Please set the pickup location on the map",
  pincode: "Enter a valid 6-digit pincode",
  mobile: "Enter a valid 10-digit mobile number",
  contactName: "Enter a valid name (at least 2 letters; letters, spaces and dots only)",
  pickupArea: "Street/Area must be at least 2 characters",
};

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const CONTACT_NAME_REGEX = /^[A-Za-z][A-Za-z .]*$/;

/** Strips spaces/dashes and an optional +91 / 91 / 0 prefix. */
export const normalizeMobile = (raw: string): string =>
  (raw || "").replace(/[\s-]/g, "").replace(/^(?:\+91|91(?=\d{10}$)|0(?=\d{10}$))/, "");

export const isValidMobile = (raw: string): boolean => /^[6-9]\d{9}$/.test(normalizeMobile(raw));

export const isValidPincode = (raw: string): boolean => PINCODE_REGEX.test((raw || "").trim());

export const isValidContactName = (raw: string): boolean => {
  const v = (raw || "").trim();
  return v.replace(/[^A-Za-z]/g, "").length >= 2 && CONTACT_NAME_REGEX.test(v);
};

/** Collapses repeated spaces and trims a typed vehicle name/model. */
export const cleanVehicleText = (raw: string): string => (raw || "").replace(/\s+/g, " ").trim();

/**
 * Typed vehicle brand/name/model: 2-50 chars, at least one letter, and only
 * letters, digits, spaces and - . / ( ) & + (e.g. "XUV 3XO", "Classic 350").
 */
export const isValidVehicleText = (raw: string): boolean => {
  const v = cleanVehicleText(raw);
  return v.length >= 2 && v.length <= 50 && /[A-Za-z]/.test(v) && /^[A-Za-z0-9 .\-/()&+]+$/.test(v);
};

/** Earliest manufacturing year accepted for a listing. */
export const MIN_MANUFACTURING_YEAR = 1980;

/**
 * Typed manufacturing year: 4 digits, from MIN_MANUFACTURING_YEAR up to next
 * year (next year's model is often on sale before the year starts).
 */
export const isValidManufacturingYear = (raw: string): boolean => {
  const v = (raw || "").trim();
  if (!/^\d{4}$/.test(v)) return false;
  const year = Number(v);
  return year >= MIN_MANUFACTURING_YEAR && year <= new Date().getFullYear() + 1;
};

export const isNumeric = (raw: string | number | undefined | null): boolean => {
  if (raw === undefined || raw === null) return false;
  const v = raw.toString().trim();
  return v !== "" && Number.isFinite(Number(v));
};

export const isPositiveNumber = (raw: string | number | undefined | null): boolean =>
  isNumeric(raw) && Number(raw) > 0;

export const isNonNegativeNumber = (raw: string | number | undefined | null): boolean =>
  isNumeric(raw) && Number(raw) >= 0;

/** Parses a stored coordinate pair; null when either part is missing/invalid. */
export const toPickupCoords = (
  lat: string | number | undefined | null,
  lng: string | number | undefined | null
): { latitude: number; longitude: number } | null => {
  if (!isNumeric(lat) || !isNumeric(lng)) return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
};

/** "Street, Area" from the geocoder, without repeating the same part twice. */
export const areaFromAddress = (address: PickupAddress): string => {
  const parts = [address.street, address.area].map((p) => (p || "").trim()).filter(Boolean);
  return Array.from(new Set(parts)).join(", ");
};

/**
 * Maps the geocoded address onto a form's own field names, keeping only
 * non-empty values so an existing entry is never overwritten with "".
 */
export const addressToFields = <K extends string>(
  address: PickupAddress,
  keys: Partial<Record<"state" | "city" | "area" | "pincode" | "country", K>>
): Partial<Record<K, string>> => {
  const source: Record<"state" | "city" | "area" | "pincode" | "country", string> = {
    state: address.state,
    city: address.city,
    area: areaFromAddress(address),
    pincode: (address.pincode || "").replace(/\s/g, ""),
    country: address.country,
  };
  const out: Partial<Record<K, string>> = {};
  (Object.keys(keys) as Array<keyof typeof source>).forEach((part) => {
    const field = keys[part];
    const value = (source[part] || "").trim();
    if (field && value) out[field] = value;
  });
  return out;
};

/** Scrolls to the first `[data-error="true"]` once React has rendered the errors. */
export const scrollToFirstError = () => {
  setTimeout(() => {
    document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 0);
};
