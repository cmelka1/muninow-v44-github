// Unified service fee calculation utility
// Formula: Service Fee = (Base Amount × Fee Percentage) + Fixed Fee
// Total Charge = Base Amount + Service Fee

export interface FeeCalculationParams {
  baseAmountCents: number;
  isCard: boolean;
  cardBasisPoints?: number;
  cardFixedFeeCents?: number;
  achBasisPoints?: number;
  achFixedFeeCents?: number;
  achBasisPointsFeeLimitCents?: number;
}

export interface FeeCalculationResult {
  baseAmountCents: number;
  serviceFeePercentageCents: number;
  serviceFeeFixedCents: number;
  totalServiceFeeCents: number;
  totalChargeCents: number;
  basisPoints: number;
  isCard: boolean;
}

/**
 * Calculate service fees using the unified formula
 * Service Fee = (Base Amount × Fee Percentage) + Fixed Fee
 * Total Charge = Base Amount + Service Fee
 */
export function calculateServiceFee(params: FeeCalculationParams): FeeCalculationResult {
  const {
    baseAmountCents,
    isCard,
    cardBasisPoints = 300,
    cardFixedFeeCents = 50,
    achBasisPoints = 150,
    achFixedFeeCents = 50,
    achBasisPointsFeeLimitCents
  } = params;

  // Select appropriate fee structure based on payment method
  const basisPoints = isCard ? cardBasisPoints : achBasisPoints;
  const fixedFeeCents = isCard ? cardFixedFeeCents : achFixedFeeCents;

  // Calculate percentage fee: (Base Amount × Fee Percentage)
  let serviceFeePercentageCents = Math.round((baseAmountCents * basisPoints) / 10000);
  
  // Apply ACH basis points fee limit if applicable
  if (!isCard && achBasisPointsFeeLimitCents && serviceFeePercentageCents > achBasisPointsFeeLimitCents) {
    serviceFeePercentageCents = achBasisPointsFeeLimitCents;
  }
  
  // Calculate total service fee: Percentage Fee + Fixed Fee
  const totalServiceFeeCents = serviceFeePercentageCents + fixedFeeCents;
  
  // Calculate total charge: Base Amount + Service Fee
  const totalChargeCents = baseAmountCents + totalServiceFeeCents;

  return {
    baseAmountCents,
    serviceFeePercentageCents,
    serviceFeeFixedCents: fixedFeeCents,
    totalServiceFeeCents,
    totalChargeCents,
    basisPoints,
    isCard
  };
}

/**
 * Validate if a provided total matches the calculated total
 * Allows for 1 cent rounding difference
 */
export function validateTotalAmount(
  baseAmountCents: number,
  providedTotalCents: number,
  isCard: boolean,
  cardBasisPoints?: number,
  cardFixedFeeCents?: number,
  achBasisPoints?: number,
  achFixedFeeCents?: number,
  achBasisPointsFeeLimitCents?: number
): { isValid: boolean; expectedTotal: number; difference: number } {
  const calculation = calculateServiceFee({
    baseAmountCents,
    isCard,
    cardBasisPoints,
    cardFixedFeeCents,
    achBasisPoints,
    achFixedFeeCents,
    achBasisPointsFeeLimitCents
  });

  const difference = Math.abs(providedTotalCents - calculation.totalChargeCents);
  const isValid = difference <= 1; // Allow 1 cent rounding difference

  return {
    isValid,
    expectedTotal: calculation.totalChargeCents,
    difference
  };
}