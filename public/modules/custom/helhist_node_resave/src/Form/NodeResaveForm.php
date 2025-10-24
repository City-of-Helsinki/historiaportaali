<?php

declare(strict_types=1);

namespace Drupal\helhist_node_resave\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Node Resave form.
 *
 * @package Drupal\helhist_node_resave\Form
 */
class NodeResaveForm extends FormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The messenger.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * NodeResaveForm constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, MessengerInterface $messenger) {
    $this->entityTypeManager = $entity_type_manager;
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('messenger')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'helhist_node_resave_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $node_types = $this->entityTypeManager->getStorage('node_type')->loadMultiple();

    $options = [];
    foreach ($node_types as $node_type) {
      $options[$node_type->id()] = $node_type->label();
    }

    $form['node_types'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Content types'),
      '#description' => $this->t('If none selected all nodes of all types will be resaved.'),
      '#options' => $options,
    ];

    $form['available_node_types'] = [
      '#type' => 'hidden',
      '#value' => $options,
    ];

    $form['chunk_size'] = [
      '#type' => 'number',
      '#title' => $this->t('Chunk size'),
      '#description' => $this->t('Number of nodes in a chunk to be processed per batch operation. 250 if left empty.'),
      '#default_value' => 250,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Resave now'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $available_node_types = $form_state->getValue('available_node_types');
    $selected_node_types = $form_state->getValue('node_types');

    $node_types = !empty(array_filter($selected_node_types)) ? array_filter(array_values($selected_node_types)) : array_keys($available_node_types);
    $chunk_size = !empty($form_state->getValue('chunk_size')) ? (int) $form_state->getValue('chunk_size') : 250;

    $this->setBatch($node_types, $chunk_size);
  }

  /**
   * Adds a new batch.
   *
   * @param array $node_types
   *   An array of node type machine names.
   * @param int $chunk_size
   *   Number of nodes to be processed per batch operation.
   */
  protected function setBatch(array $node_types, $chunk_size) {
    // An array with lots of node IDs.
    $nids = $this->getNodeIds($node_types);
    // Chop array into sub-arrays (chunks) of specified size.
    $chunks = array_chunk($nids, $chunk_size);
    $num_chunks = count($chunks);

    // Now resave all nodes chunk by chunk.
    $operations = [];
    for ($i = 0; $i < $num_chunks; $i++) {
      $operations[] = [
        '\Drupal\helhist_node_resave\Batch\NodeResaveBatch::batchOperation',
        [$chunks[$i]],
      ];
    }

    $batch = [
      'title' => $this->t('Resaving nodes'),
      'progress_message' => $this->t('Completed @current out of @total chunks.'),
      'finished' => '\Drupal\helhist_node_resave\Batch\NodeResaveBatch::batchFinished',
      'operations' => $operations,
    ];

    batch_set($batch);
  }

  /**
   * Get an array node IDs.
   *
   * @param array $node_types
   *   An array of node type machine names.
   *
   * @return array|int
   *   An array of node IDs at best.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function getNodeIds(array $node_types) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery();
    $nids = $query->condition('type', $node_types, 'IN')->accessCheck(FALSE)->execute();

    return $nids;
  }

}
