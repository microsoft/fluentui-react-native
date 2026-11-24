import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';

export function StepAnnouncement({ stepKey, text }: { stepKey: string; text: string }) {
  const previous = useRef(stepKey);
  useEffect(() => {
    if (previous.current === stepKey) return;
    previous.current = stepKey;
    if (typeof AccessibilityInfo.announceForAccessibilityWithOptions === 'function') {
      AccessibilityInfo.announceForAccessibilityWithOptions(text, { queue: true });
    } else {
      AccessibilityInfo.announceForAccessibility?.(text);
    }
  }, [stepKey, text]);
  return null;
}
