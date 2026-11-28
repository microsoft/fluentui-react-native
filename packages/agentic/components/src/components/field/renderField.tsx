/** @jsxImportSource @fluentui-react-native/framework-base */
import type { FieldState } from './field.types';

export function renderField_unstable(state: FieldState) {
  const { label: Label, infoLabel: InfoLabel, messageStack: Messages, helper: Helper, helperLabel: HelperLabel } = state;
  const { validationRow: Feedback, validationIcon: Mark, validationText: FeedbackText, validationLabel: FeedbackLabel } = state;
  return (
    <state.root>
      {Label && <Label />}
      {InfoLabel && <InfoLabel />}
      <state.controlColumn>
        {state.renderControl(state.binding)}
        {Messages && (
          <Messages>
            {Helper && HelperLabel && (
              <Helper>
                <HelperLabel />
              </Helper>
            )}
            {Feedback && (
              <Feedback>
                {Mark && <Mark />}
                {FeedbackText && FeedbackLabel && (
                  <FeedbackText>
                    <FeedbackLabel />
                  </FeedbackText>
                )}
              </Feedback>
            )}
          </Messages>
        )}
      </state.controlColumn>
    </state.root>
  );
}
