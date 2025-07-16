export interface Status {
  id: number;
  statusName: string;
  isActive: boolean;
}

export interface ApprovalData {
  id: number;
  monthlyId?: number;
  sourceType: number;
  sourceName: number;
  status: number;
  statusName: string;
  byUser: number;
  date: string;
  productionVolume: number;
  operationHours: number;
  serviceInterruption: number;
  totalHoursServiceInterruption: number;
  electricityConsumption: number;
  VFDFrequency: number;
  spotFlow: number;
  spotPressure: number;
  timeSpotMeasurements: number;
  lineVoltage1: number;
  lineVoltage2: number;
  lineVoltage3: number;
  lineCurrent1: number;
  lineCurrent2: number;
  lineCurrent3: number;
  comment: string;
  isActive: boolean;
  branchId: number;
  branchName: string;
  areaName: string;
  encodedAt?: string;
}

export interface MonthlyApprovalData {
  id: number;
  branchId: number;
  branchName: string;
  areaId: number;
  areaName: string;
  sourceType: number;
  sourceTypeName: string;
  sourceName: number;
  sourceNameName: string;
  status: number;
  statusName: string;
  byUser: number;
  month: string;
  year: number;
  productionVolume: number;
  operationHours: number;
  serviceInterruption: number;
  totalHoursServiceInterruption: number;
  productionVolumeAutoSum: number;
  operationHoursAutoSum: number;
  serviceInterruptionAutoSum: number;
  totalHoursServiceInterruptionAutoSum: number;
  electricityConsumption: number;
  electricityCost: number;
  bulkCost: number;
  bulkOuttake: string;
  bulkProvider: string;
  WTPCost: number;
  WTPSource: number;
  WTPVolume: number;
  disinfectionMode: string;
  disinfectantCost: number;
  disinfectionAmount: number;
  disinfectionBrandType: string;
  otherTreatmentCost: number;
  emergencyLitersConsumed: number;
  emergencyFuelCost: number;
  emergencyTotalHoursUsed: number;
  gensetLitersConsumed: number;
  gensetFuelCost: number;
  isActive: boolean;
  comment: string;
} 