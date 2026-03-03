import { CerereStatus, CerereStatusType } from "@/lib/validations/cereri";

/**
 * User roles for cereri workflow transitions.
 * Maps to user_primarii.rol values.
 */
export type UserRole = "cetatean" | "functionar" | "admin" | "primar";

/**
 * Full role-based transition matrix.
 * Maps each status to the allowed next statuses per role.
 *
 * Key rules:
 * - depusa: citizen can cancel, functionar+ can start verification
 * - in_aprobare: ONLY primar can approve/reject
 * - aprobata: any staff can finalize
 * - Terminal states (respinsa, anulata, finalizata): no transitions
 */
export const TRANSITION_MATRIX: Record<
  CerereStatusType,
  Partial<Record<UserRole, CerereStatusType[]>>
> = {
  [CerereStatus.DEPUSA]: {
    cetatean: [CerereStatus.ANULATA],
    functionar: [CerereStatus.IN_VERIFICARE],
    admin: [CerereStatus.IN_VERIFICARE],
    primar: [CerereStatus.IN_VERIFICARE],
  },
  [CerereStatus.IN_VERIFICARE]: {
    cetatean: [CerereStatus.ANULATA],
    functionar: [CerereStatus.INFO_SUPLIMENTARE, CerereStatus.IN_PROCESARE, CerereStatus.RESPINSA],
    admin: [CerereStatus.INFO_SUPLIMENTARE, CerereStatus.IN_PROCESARE, CerereStatus.RESPINSA],
    primar: [CerereStatus.INFO_SUPLIMENTARE, CerereStatus.IN_PROCESARE, CerereStatus.RESPINSA],
  },
  [CerereStatus.INFO_SUPLIMENTARE]: {
    cetatean: [CerereStatus.IN_VERIFICARE, CerereStatus.ANULATA],
  },
  [CerereStatus.IN_PROCESARE]: {
    cetatean: [CerereStatus.ANULATA],
    functionar: [CerereStatus.IN_APROBARE, CerereStatus.RESPINSA],
    admin: [CerereStatus.IN_APROBARE, CerereStatus.RESPINSA],
    primar: [CerereStatus.IN_APROBARE, CerereStatus.RESPINSA],
  },
  [CerereStatus.IN_APROBARE]: {
    primar: [CerereStatus.APROBATA, CerereStatus.RESPINSA],
  },
  [CerereStatus.APROBATA]: {
    functionar: [CerereStatus.FINALIZATA],
    admin: [CerereStatus.FINALIZATA],
    primar: [CerereStatus.FINALIZATA],
  },
  [CerereStatus.RESPINSA]: {},
  [CerereStatus.ANULATA]: {},
  [CerereStatus.FINALIZATA]: {},
};

/**
 * Statuses that require a reason/motiv when transitioning TO them.
 */
export const REASONS_REQUIRED_STATUSES = new Set<CerereStatusType>([
  CerereStatus.RESPINSA,
  CerereStatus.INFO_SUPLIMENTARE,
  CerereStatus.ANULATA,
]);

/**
 * Get available status transitions for a given status and user role.
 *
 * @param currentStatus - The current cerere status
 * @param userRole - The user's role for this primarie
 * @returns Array of valid target statuses
 */
export function getAvailableTransitions(
  currentStatus: CerereStatusType,
  userRole: UserRole
): CerereStatusType[] {
  return TRANSITION_MATRIX[currentStatus]?.[userRole] ?? [];
}

/**
 * Check if a specific transition is valid for a given role.
 *
 * @param from - Current status
 * @param to - Target status
 * @param role - User role
 * @returns true if the transition is allowed
 */
export function canTransition(
  from: CerereStatusType,
  to: CerereStatusType,
  role: UserRole
): boolean {
  return getAvailableTransitions(from, role).includes(to);
}

/**
 * Check if a reason is required when transitioning to the given status.
 *
 * @param newStatus - The target status
 * @returns true if a reason/motiv is required
 */
export function requiresReason(newStatus: CerereStatusType): boolean {
  return REASONS_REQUIRED_STATUSES.has(newStatus);
}
