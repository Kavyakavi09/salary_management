import { Decimal } from "@prisma/client/runtime/library";

export const calculateNetSalary = (
  gross: Decimal | number | string,
  tdsRate: Decimal | number | string
) => {
  const amount = new Decimal(gross);
  const rate = new Decimal(tdsRate);
  const deduction = amount.mul(rate);
  const net = amount.sub(deduction);

  return {
    gross: amount.toFixed(2),
    tdsRate: rate.toFixed(4),
    deduction: deduction.toFixed(2),
    net: net.toFixed(2),
  };
};
