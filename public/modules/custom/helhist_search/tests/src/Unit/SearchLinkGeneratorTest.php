<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Unit;

use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\helhist_search\SearchLinkGenerator;
use Drupal\helhist_search\SearchPathResolver;
use Drupal\Tests\UnitTestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;

/**
 * Tests the SearchLinkGenerator.
 */
#[Group('helhist_search')]
class SearchLinkGeneratorTest extends UnitTestCase {

  /**
   * Service under test.
   */
  protected SearchLinkGenerator $generator;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $searchPathResolver = $this->createMock(SearchPathResolver::class);
    $searchPathResolver->method('getSearchPagePath')->willReturn('/search');

    $translation = $this->createMock(TranslationInterface::class);
    $translation->method('translateString')->willReturnCallback(
      fn ($wrapper) => $wrapper->getUntranslatedString()
    );

    $this->generator = new SearchLinkGenerator($searchPathResolver, $translation);
  }

  /**
   * Tests that filter fields produce filter parameter URLs.
   */
  #[DataProvider('filterFieldProvider')]
  public function testGenerateSearchUrlFilterFields(string $field_name, string $value, string $expected): void {
    $this->assertEquals($expected, $this->generator->generateSearchUrl($field_name, $value));
  }

  /**
   * Data provider for filter field tests.
   */
  public static function filterFieldProvider(): array {
    return [
      'phenomena field' => ['field_phenomena', 'Nature', '/search?phenomena=Nature'],
      'neighbourhoods field' => ['field_neighbourhoods', 'Kallio', '/search?neighbourhoods=Kallio'],
      'formats field' => ['field_formats', 'Photo', '/search?formats=Photo'],
      'value with special chars' => ['field_phenomena', 'Art & Design', '/search?phenomena=Art%20%26%20Design'],
      'unmapped field falls back to keyword' => ['field_topics', 'Helsinki', '/search?q=Helsinki'],
      'html entities are decoded' => ['field_topics', 'Art &amp; Design', '/search?q=Art%20%26%20Design'],
    ];
  }

  /**
   * Tests that text-only fields return NULL.
   */
  #[DataProvider('textOnlyFieldProvider')]
  public function testGenerateSearchUrlTextOnlyFields(string $field_name): void {
    $this->assertNull($this->generator->generateSearchUrl($field_name, 'some value'));
  }

  /**
   * Data provider for text-only field tests.
   */
  public static function textOnlyFieldProvider(): array {
    return [
      'keywords' => ['field_keywords'],
      'copyrights' => ['field_copyrights'],
      'buildings' => ['field_buildings'],
    ];
  }

  /**
   * Tests year search URL generation.
   */
  #[DataProvider('yearSearchUrlProvider')]
  public function testGenerateYearSearchUrl(int|string|null $start, int|string|null $end, string $expected): void {
    $this->assertEquals($expected, $this->generator->generateYearSearchUrl($start, $end));
  }

  /**
   * Data provider for year search URL tests.
   */
  public static function yearSearchUrlProvider(): array {
    return [
      'single year' => [1992, NULL, '/search?startYear=1992&endYear=1992'],
      'year range' => [1990, 2000, '/search?startYear=1990&endYear=2000'],
      'negative start year' => [-500, 100, '/search?startYear=-500&endYear=100'],
      'null start year' => [NULL, NULL, '/search'],
      'string years' => ['1992', '1999', '/search?startYear=1992&endYear=1999'],
    ];
  }

  /**
   * Tests period formatting.
   */
  #[DataProvider('formatPeriodProvider')]
  public function testFormatPeriod(int|string|null $start, int|string|null $end, string $expected): void {
    $this->assertEquals($expected, $this->generator->formatPeriod($start, $end));
  }

  /**
   * Data provider for format period tests.
   */
  public static function formatPeriodProvider(): array {
    return [
      'single year' => [1992, NULL, '1992'],
      'same start and end' => [1992, 1992, '1992'],
      'year range' => [1990, 2000, '1990 – 2000'],
      'negative year (BCE)' => [-500, NULL, '500 BCE'],
      'BCE range' => [-500, -100, '500 BCE – 100 BCE'],
      'BCE to CE range' => [-500, 100, '500 BCE – 100'],
      'null start' => [NULL, NULL, ''],
    ];
  }

}
