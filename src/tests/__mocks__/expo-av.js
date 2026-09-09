module.exports = {
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          setOnPlaybackStatusUpdate: jest.fn(),
          unloadAsync: jest.fn().mockResolvedValue(true),
        },
      }),
    },
  },
};
