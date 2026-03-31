<?php

declare(strict_types=1);

namespace Drupal\Tests\helhist_search\Kernel\Form;

use Drupal\helhist_search\Form\HeaderSearchForm;
use Drupal\KernelTests\KernelTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Tests the HeaderSearchForm.
 */
#[Group('helhist_search')]
#[RunTestsInSeparateProcesses]
class HeaderSearchFormTest extends KernelTestBase {

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
    $form = $formBuilder->getForm(HeaderSearchForm::class);

    $this->assertIsArray($form);
    $this->assertEquals('get', $form['#method']);
    $this->assertEquals('search', $form['#attributes']['role']);

    // Label is visually hidden.
    $this->assertEquals('label', $form['search_wrapper']['label']['#tag']);
    $this->assertEquals('edit-q-header', $form['search_wrapper']['label']['#attributes']['for']);
    $this->assertContains('hiddenFromScreen', $form['search_wrapper']['label']['#attributes']['class']);

    // Search input is nested in input_wrapper.
    $this->assertArrayHasKey('input_wrapper', $form['search_wrapper']);
    $this->assertEquals('textfield', $form['search_wrapper']['input_wrapper']['q']['#type']);
    $this->assertEquals('edit-q-header', $form['search_wrapper']['input_wrapper']['q']['#attributes']['id']);
    $this->assertEquals('80', $form['search_wrapper']['input_wrapper']['q']['#size']);

    // Submit button.
    $this->assertEquals('button', $form['search_wrapper']['input_wrapper']['submit']['#tag']);
    $this->assertContains('hds-button--theme-black', $form['search_wrapper']['input_wrapper']['submit']['#attributes']['class']);
  }

}
