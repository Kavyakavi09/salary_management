export type EmployeeStatus = "active" | "inactive";

export type CurrentSalary = {
  id: string;
  amount: string;
  currencyCode: string;
  payPeriod: string;
  effectiveFrom: string;
  changeType: string;
};

export type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentId: number;
  department?: { id: number; name: string };
  countryId: number;
  country?: {
    id: number;
    name: string;
    currencyCode: string;
    tdsRate: string;
  };
  currentSalary: CurrentSalary | null;
  hireDate: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EmployeeListResponse = {
  success: boolean;
  message: string;
  data: Employee[];
  meta: EmployeeListMeta;
};

export type EmployeePayload = {
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentId: number;
  countryId: number;
  hireDate: string;
};
