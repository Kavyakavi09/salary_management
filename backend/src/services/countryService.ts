import AppError from "../utils/AppError";
import countryRepository from "../repositories/countryRepository";
import currencyRepository from "../repositories/currencyRepository";

const toCountryResponse = (country: {
  id: number;
  name: string;
  currencyCode: string;
  tdsRate: { toString(): string };
  createdAt: Date;
}) => ({
  id: country.id,
  name: country.name,
  currencyCode: country.currencyCode,
  tdsRate: country.tdsRate.toString(),
  createdAt: country.createdAt,
});

const listCountries = async () => {
  const countries = await countryRepository.findAll();
  return countries.map(toCountryResponse);
};

const getCountry = async (id: number) => {
  const country = await countryRepository.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }
  return toCountryResponse(country);
};

const createCountry = async (body: {
  name?: string;
  currencyCode?: string;
  tdsRate?: number;
}) => {
  const { name, currencyCode, tdsRate } = body;

  if (!name?.trim() || !currencyCode?.trim() || tdsRate === undefined) {
    throw new AppError("name, currencyCode and tdsRate are required", 400);
  }

  if (Number(tdsRate) < 0 || Number(tdsRate) > 1) {
    throw new AppError("tdsRate must be between 0 and 1", 400);
  }

  const trimmedName = name.trim();
  const code = currencyCode.trim().toUpperCase();

  const existing = await countryRepository.findByName(trimmedName);
  if (existing) {
    throw new AppError("Country with this name already exist", 400);
  }

  const currency = await currencyRepository.findByCode(code);
  if (!currency) {
    throw new AppError("Currency not found", 404);
  }

  const country = await countryRepository.create({
    name: trimmedName,
    currencyCode: code,
    tdsRate,
  });

  return toCountryResponse(country);
};

const updateCountry = async (
  id: number,
  body: {
    name?: string;
    currencyCode?: string;
    tdsRate?: number;
  }
) => {
  const country = await countryRepository.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  if (body.tdsRate !== undefined && (Number(body.tdsRate) < 0 || Number(body.tdsRate) > 1)) {
    throw new AppError("tdsRate must be between 0 and 1", 400);
  }

  if (body.name?.trim()) {
    const existing = await countryRepository.findByName(body.name.trim());
    if (existing && existing.id !== id) {
      throw new AppError("Country with this name already exist", 400);
    }
  }

  let nextCurrencyCode: string | undefined;
  if (body.currencyCode !== undefined) {
    nextCurrencyCode = body.currencyCode.trim().toUpperCase();
    const currency = await currencyRepository.findByCode(nextCurrencyCode);
    if (!currency) {
      throw new AppError("Currency not found", 404);
    }
  }

  const updated = await countryRepository.update(id, {
    ...(body.name !== undefined ? { name: body.name.trim() } : {}),
    ...(nextCurrencyCode !== undefined ? { currencyCode: nextCurrencyCode } : {}),
    ...(body.tdsRate !== undefined ? { tdsRate: body.tdsRate } : {}),
  });

  return toCountryResponse(updated);
};

const deleteCountry = async (id: number) => {
  const country = await countryRepository.findById(id);
  if (!country) {
    throw new AppError("Country not found", 404);
  }

  const employeeCount = await countryRepository.countEmployees(id);
  if (employeeCount > 0) {
    throw new AppError(
      "Cannot delete country while employees are assigned to it",
      400
    );
  }

  await countryRepository.delete(id);
  return { id };
};

export default {
  listCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
};
