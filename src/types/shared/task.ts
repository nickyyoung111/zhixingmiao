export type EnergyLevel = "低能量" | "中能量" | "高能量";

export type Task = {
  id: string | number;
  title: string;
  area: string;
  energy: EnergyLevel;
  done: boolean;
  dueLabel: string;
};
