export default {
  title: 'Components/FixtureButton',
};

export const Default = {
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'clicks-button',
          requires: ['physical-click'],
          steps: [{ action: 'click', target: { testId: 'fixture-button' } }],
        },
      ],
    },
  },
};
