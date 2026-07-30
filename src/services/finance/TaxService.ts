export class TaxService {
  /**
   * Server-side tax calculation to prevent frontend manipulation.
   * Standard restaurant GST in India: 5% total (2.5% CGST, 2.5% SGST) without ITC.
   * If alcohol is involved, state taxes apply differently, but we assume standard food delivery.
   */
  static calculateGST(subtotal: number, isInterState: boolean = false) {
    const totalGstPercent = 5;

    if (isInterState) {
      return {
        cgst: 0,
        sgst: 0,
        igst: (subtotal * totalGstPercent) / 100,
        totalTax: (subtotal * totalGstPercent) / 100,
      };
    }

    const cgst = (subtotal * 2.5) / 100;
    const sgst = (subtotal * 2.5) / 100;

    return {
      cgst,
      sgst,
      igst: 0,
      totalTax: cgst + sgst,
    };
  }
}
