import { z } from 'zod';

const moneySchema = z.coerce.number().min(0).max(1_000_000);

export const updateFinancialSettingsSchema = z.object({
  transcriptFee: moneySchema,
  clearanceFee: moneySchema,
  collegeTuitions: z
    .array(
      z.object({
        collegeId: z.string().uuid(),
        annualAmount: moneySchema,
      })
    )
    .min(1),
});

export type UpdateFinancialSettingsInput = z.infer<typeof updateFinancialSettingsSchema>;
