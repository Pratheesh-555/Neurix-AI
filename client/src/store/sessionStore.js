import { create } from 'zustand';

const useSessionStore = create((set, get) => ({
  sessionId:   null,
  programId:   null,
  activities:  [],          // from program.program.activities
  logs:        [],          // { activityId, result, timestamp }
  pivots:      {},          // activityId → pivotActivity object
  engagementScore: 0,

  initSession: (sessionId, programId, activities) =>
    set({ sessionId, programId, activities, logs: [], pivots: {}, engagementScore: 0 }),

  addLog: (activityId, result) =>
    set((s) => ({ logs: [...s.logs, { activityId, result, timestamp: Date.now() }] })),

  setPivot: (activityId, pivotActivity) =>
    set((s) => ({ pivots: { ...s.pivots, [activityId]: pivotActivity } })),

  setEngagementScore: (score) => set({ engagementScore: score }),

  // Returns how many consecutive resistant logs the activity has at the END of logs[]
  consecutiveResistance: (activityId) => {
    const { logs } = get();
    const forActivity = logs.filter(l => l.activityId === activityId);
    let count = 0;
    for (let i = forActivity.length - 1; i >= 0; i--) {
      if (forActivity[i].result === 'resistant') count++;
      else break;
    }
    return count;
  },

  reset: () => set({ sessionId: null, programId: null, activities: [], logs: [], pivots: {}, engagementScore: 0 }),
}));

export default useSessionStore;
