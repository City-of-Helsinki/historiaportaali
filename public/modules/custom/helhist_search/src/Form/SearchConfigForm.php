<?php

declare(strict_types=1);

namespace Drupal\helhist_search\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configure search page settings.
 */
class SearchConfigForm extends ConfigFormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Constructs a SearchConfigForm object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entity_type_manager, ModuleHandlerInterface $module_handler) {
    parent::__construct($config_factory);
    $this->entityTypeManager = $entity_type_manager;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new self(
      $container->get('config.factory'),
      $container->get('entity_type.manager'),
      $container->get('module_handler')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['helhist_search.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'helhist_search_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('helhist_search.settings');

    if ($this->moduleHandler->moduleExists('helhist_kore_search')) {
      $form['kore_search_page_node'] = [
        '#type' => 'entity_autocomplete',
        '#target_type' => 'node',
        '#title' => $this->t('School register search page'),
        '#description' => $this->t('The node that host the koulurekisteri search.'),
        '#default_value' => $config->get('kore_search_page_node') ? $this->entityTypeManager->getStorage('node')->load($config->get('kore_search_page_node')) : NULL,
        '#required' => FALSE,
      ];
    }

    $form['search_page_node'] = [
      '#type' => 'entity_autocomplete',
      '#target_type' => 'node',
      '#title' => $this->t('Main search page'),
      '#description' => $this->t('The node that host site main search.'),
      '#default_value' => $config->get('search_page_node') ? $this->entityTypeManager->getStorage('node')->load($config->get('search_page_node')) : NULL,
      '#required' => TRUE,
    ];
    $form['mapping_mode'] = [
      '#type' => 'select',
      '#title' => $this->t('Search mapping mode'),
      '#description' => $this->t('Choose whether the React search uses keyword fields or text fields.'),
      '#options' => [
        'text' => $this->t('Text mapping'),
        'keyword' => $this->t('Keyword mapping'),
      ],
      '#default_value' => $config->get('mapping_mode') ?: 'text',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->config('helhist_search.settings')
      ->set('search_page_node', $form_state->getValue('search_page_node'))
      ->set('mapping_mode', $form_state->getValue('mapping_mode'));

    if ($this->moduleHandler->moduleExists('helhist_kore_search')) {
      $config->set('kore_search_page_node', $form_state->getValue('kore_search_page_node'));
    }

    $config->save();
    parent::submitForm($form, $form_state);
  }

}
