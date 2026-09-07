module.exports = {
  playHaptic: jest.fn().mockImplementation((style) => Promise.resolve(true)),
};
