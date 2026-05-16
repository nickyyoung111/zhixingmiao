export type GrowthEvidence = {
  id: string | number;
  title: string;
  category: "行动完成" | "实践体验" | "情绪照顾" | "沟通练习" | "奖励领取";
  note: string;
  createdAt: string;
  fishEarned: number;
};
