<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_admin_forms\ExistingSiteJavascript;

use Drupal\Tests\helfi_api_base\FunctionalJavascript\ExistingSiteJavascriptTestBase;
use PHPUnit\Framework\Attributes\Group;

/**
 * Tests the Finna.fi import JavaScript functionality.
 */
#[Group('helhist_admin_forms')]
class FinnaImportTest extends ExistingSiteJavascriptTestBase {

  private const string FINNA_RECORD_ID = 'museovirasto.BEB185ED545223BA69099542C58A8108';

  /**
   * Tests that the Finna import button appears and populates fields.
   */
  public function testFinnaImportPopulatesFields(): void {
    $user = $this->createUser([], NULL, TRUE);
    $this->drupalLogin($user);
    // Navigate in Finnish so the JS sends lng=fi to the Finna API.
    $this->drupalGetWithLanguage('/node/add/article', 'fi');

    $page = $this->getSession()->getPage();
    /** @var \Drupal\FunctionalJavascriptTests\JSWebAssert $assert */
    $assert = $this->assertSession();

    // Open the Finna.fi metadata fieldset.
    $finnaFieldset = $page->find('named', ['link_or_button', 'Finna.fi metatietokentät']);
    if ($finnaFieldset) {
      $finnaFieldset->click();
      $assert->waitForField('field_finna_id[0][value]');
    }

    // Fill in the Finna ID.
    $finnaIdField = $assert->waitForField('field_finna_id[0][value]');
    $this->assertNotNull($finnaIdField, 'Finna ID field should exist.');
    $finnaIdField->setValue(self::FINNA_RECORD_ID);

    // Verify the import button was rendered by the JS behavior.
    $importButton = $assert->waitForElement('css', '#finna');
    $this->assertNotNull($importButton, 'Finna.fi import button should be rendered by JavaScript.');

    // Click the import button.
    $importButton->click();

    // Wait for Select2 fields to get populated.
    // The test record has: formats "Kuva", author "Heinonen, Helge",
    // copyright "CC BY-ND 4.0", buildings "Museovirasto" and
    // "Historian kuvakokoelma".
    $this->assertSelect2HasValue('#edit-field-formats', 'Kuva');
    $this->assertSelect2HasValue('#edit-field-authors', 'Heinonen, Helge');
    $this->assertSelect2HasValue('#edit-field-copyrights', 'CC BY-ND 4.0');
    $this->assertSelect2HasValue('#edit-field-buildings', 'Museovirasto');
  }

  /**
   * Asserts that a Select2 field contains a given value.
   *
   * @param string $fieldSelector
   *   CSS selector for the underlying select element.
   * @param string $expectedText
   *   The expected option text.
   */
  private function assertSelect2HasValue(string $fieldSelector, string $expectedText): void {
    $result = $this->getSession()->getPage()->waitFor(10, function () use ($fieldSelector, $expectedText) {
      $container = $this->getSession()->getPage()->find('css', $fieldSelector);
      if (!$container) {
        return FALSE;
      }
      // Check selected <option> elements on the underlying select.
      $options = $container->findAll('css', 'option[selected]');
      foreach ($options as $option) {
        if (str_contains($option->getText(), $expectedText)) {
          return TRUE;
        }
      }
      // Also check options that are simply present (Select2 appends them).
      $options = $container->findAll('css', 'option');
      foreach ($options as $option) {
        if ($option->getValue() && str_contains($option->getText(), $expectedText)) {
          return TRUE;
        }
      }
      return FALSE;
    });

    $this->assertTrue($result, sprintf(
      'Select2 field "%s" should contain "%s".',
      $fieldSelector,
      $expectedText,
    ));
  }

}
