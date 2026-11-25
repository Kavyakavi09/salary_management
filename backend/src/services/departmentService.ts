import AppError from "../utils/AppError";
import departmentRepository from "../repositories/departmentRepository";

const listDepartments = async () => {
  return departmentRepository.findAll();
};

const getDepartment = async (id: number) => {
  const department = await departmentRepository.findById(id);
  if (!department) {
    throw new AppError("Department not found", 404);
  }
  return department;
};

const createDepartment = async (name?: string) => {
  if (!name || !name.trim()) {
    throw new AppError("Department name is required", 400);
  }

  const trimmed = name.trim();
  const existing = await departmentRepository.findByName(trimmed);
  if (existing) {
    throw new AppError("Department with this name already exist", 400);
  }

  return departmentRepository.create(trimmed);
};

const updateDepartment = async (id: number, name?: string) => {
  const department = await departmentRepository.findById(id);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  if (!name || !name.trim()) {
    throw new AppError("Department name is required", 400);
  }

  const trimmed = name.trim();
  const existing = await departmentRepository.findByName(trimmed);
  if (existing && existing.id !== id) {
    throw new AppError("Department with this name already exist", 400);
  }

  return departmentRepository.update(id, trimmed);
};

const deleteDepartment = async (id: number) => {
  const department = await departmentRepository.findById(id);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  const employeeCount = await departmentRepository.countEmployees(id);
  if (employeeCount > 0) {
    throw new AppError(
      "Cannot delete department while employees are assigned to it",
      400
    );
  }

  await departmentRepository.delete(id);
  return { id };
};

export default {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
