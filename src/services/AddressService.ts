export class AddressService {
  /**
   * Validates a raw address string from the profile payload and converts it to a structured format for snapshots.
   * In a real system, this would parse pincodes and verify coordinates against the kitchen's delivery radius.
   * For this phase, we ensure it's not empty and convert it into a basic snapshot format.
   */
  static validateAndFormat(addressString: string | undefined | null) {
    if (!addressString || addressString.trim() === "") {
      return null;
    }

    // Split basic comma-separated address if available, otherwise just put it all in 'street'
    const parts = addressString.split(",").map((s) => s.trim());

    return {
      label: "home",
      street: parts[0] || addressString,
      city: parts.length > 1 ? parts[1] : "Pune", // Default to Pune if missing
      state: parts.length > 2 ? parts[2] : "Maharashtra",
      zipCode: parts.length > 3 ? parts[3] : "411001", // Default generic zip
    };
  }
}
