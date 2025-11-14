/**
 * Translation helper that provides fallbacks when Drupal.t is not available
 */
export const t = (
  text: string, 
  args?: Record<string, any>, 
  options?: { context?: string }
): string => {
  if (typeof Drupal !== 'undefined' && typeof Drupal.t === 'function') {
    return Drupal.t(text, args, options);
  }
  
  // Return the original text as fallback
  return text;
};

