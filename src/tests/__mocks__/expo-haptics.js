module.exports = {
  impactAsync: jest.fn().mockResolvedValue(true),
  selectionAsync: jest.fn().mockResolvedValue(true),
  notificationAsync: jest.fn().mockResolvedValue(true),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
};
