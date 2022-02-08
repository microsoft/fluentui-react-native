export let isHighContrastEnabled = false;

export function setIsHighContrast(isHighContrast: boolean) {
  isHighContrastEnabled = isHighContrast;
}

export function getIsHighContrast() {
  return isHighContrastEnabled;
}
