/**
 * Translation helper that provides fallbacks when Drupal.t is not available
 */
export const t = (
  text: string, 
  args?: Record<string, any>, 
  options?: { context?: string }
): string => {
  if (typeof window !== 'undefined' && window.Drupal && typeof window.Drupal.t === 'function') {
    return window.Drupal.t(text, args, options);
  }
  
  // Return the original text as fallback
  return text;
};

