<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Form;

use Drupal\helhist_search\Form\FrontpageSearchForm;
use Drupal\KernelTests\KernelTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the FrontpageSearchForm.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class FrontpageSearchFormTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'helhist_search',
  ];

  /**
   * Tests that the form builds correctly.
   */
  public function testFormBuild(): void {
    /** @var \Drupal\Core\Form\FormBuilderInterface $formBuilder */
    $formBuilder = $this->container->get('form_builder');
    $form = $formBuilder->getForm(FrontpageSearchForm::class);

    $this->assertIsArray($form);
    $this->assertEquals('get', $form['#method']);
    $this->assertEquals('search', $form['#attributes']['role']);

    // Label.
    $this->assertEquals('label', $form['search_wrapper']['label']['#tag']);
    $this->assertEquals('edit-q-frontpage', $form['search_wrapper']['label']['#attributes']['for']);
    $this->assertContains('hds-text-input__label', $form['search_wrapper']['label']['#attributes']['class']);

    // Search input.
    $this->assertEquals('textfield', $form['search_wrapper']['q']['#type']);
    $this->assertEquals('edit-q-frontpage', $form['search_wrapper']['q']['#attributes']['id']);

    // Submit button.
    $this->assertEquals('button', $form['search_wrapper']['submit']['#tag']);
    $this->assertContains('hds-button--primary', $form['search_wrapper']['submit']['#attributes']['class']);
  }

}
