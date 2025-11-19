<?php

declare(strict_types=1);

namespace Drupal\helhist_search;

use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Resolves search page paths based on language.
 */
class SearchPathResolver {

  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructs a new SearchPathResolver object.
   *
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager service.
   */
  public function __construct(LanguageManagerInterface $language_manager) {
    $this->languageManager = $language_manager;
  }

  /**
   * Get the search page path based on current language.
   *
   * @return string
   *   The search page path.
   */
  public function getSearchPagePath(): string {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();

    return match ($langcode) {
      'sv' => '/sv/sok',
      'en' => '/en/search',
      default => '/fi/haku',
    };
  }

}
